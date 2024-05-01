import {app, BrowserWindow} from 'electron';
import bufferToArrayBuffer from 'buffer-to-arraybuffer';

let window_;
let windowLoad;

export default async function fetch(url, options = {}) {
	await app.whenReady();

	if (!window_) {
		window_ = new BrowserWindow({
			show: false,
			sandbox: true,
		});

		window_.loadURL('about:blank');

		windowLoad = window_.webContents.executeJavaScript(
			ProxyFetch.toString()
			+ 'window.proxyFetcher = new ProxyFetch();',
		);
	}

	await windowLoad;

	return ProxyFetch.unproxy(await window_.webContents.executeJavaScript(`
		window.proxyFetcher.fetch('${url}', JSON.parse('${JSON.stringify(options)}'));
	`, true));
}

class ProxyFetch {
	constructor() {
		this.autoIncrementId = 0;
		this.responses = {};
	}

	async fetch(...arguments_) {
		const response = await fetch(...arguments_);
		return this.newResponse(response);
	}

	clone(id) {
		const response = this.responses[id].clone();
		return this.newResponse(response);
	}

	newResponse(response) {
		const id = this.autoIncrementId++;
		this.responses[id] = response;

		const headers = [];
		const isFunction = {isFunction: true};

		for (const header of response.headers.entries()) {
			headers.push(header);
		}

		return {
			id,
			type: response.type,
			url: response.url,
			redirected: response.redirected,
			status: response.status,
			ok: response.ok,
			statusText: response.statusText,
			bodyUsed: response.bodyUsed,
			headers,
			clone: isFunction,
			arrayBuffer: isFunction,
			json: isFunction,
			text: isFunction,
		};
	}

	call(id, method, ...arguments_) {
		const response = this.responses[id];
		if (!response) {
			throw new Error('Could not find response');
		}

		if (method === 'arrayBuffer') {
			method = 'text';
		}

		delete this.responses[id];
		return response[method](...arguments_);
	}

	static unproxy(response) {
		response.headers = new FetchHeaders(response.headers);

		for (const key of Object.keys(response)) {
			if (response[key].isFunction) {
				response[key] = ProxyFetch.lazyCall(response.id, key);
			}
		}

		delete response.id;
		return response;
	}

	static lazyCall(id, method) {
		return async function (...arguments_) {
			if (this.bodyUsed) {
				throw new Error('body stream is locked');
			}

			if (method === 'clone') {
				return ProxyFetch.unproxy(await window_.webContents.executeJavaScript(
					`window.proxyFetcher.clone(${id})`,
				));
			}

			this.bodyUsed = true;

			let result = await window_.webContents.executeJavaScript(
				`window.proxyFetcher.call(${id}, '${method}', ...JSON.parse('${JSON.stringify(arguments_)}'))`,
			);

			if (method === 'arrayBuffer') {
				const buffer = Buffer.from(result);
				result = bufferToArrayBuffer(buffer);
			}

			return result;
		};
	}
}

class FetchHeaders {
	constructor(headers) {
		this.headers = new Map();
		for (const [key, value] of headers) {
			this.append(key, value);
		}

		Object.defineProperty(this, 'headers', {enumerable: false});
	}

	append(key, value) {
		key = key.toLowerCase();
		const values = this.headers.get(key) || [];
		values.push(`${value}`);
		this.headers.set(key, values);
	}

	delete(key) {
		key = key.toLowerCase();
		this.headers.delete(key);
	}

	entries() {
		const entries = [];
		for (const [key, value] of this.headers.entries()) {
			entries.push([key, value.join(', ')]);
		}

		return entries;
	}

	get(key) {
		key = key.toLowerCase();
		const value = this.headers.get(key);
		if (!value) {
			return null;
		}

		return value.join(', ');
	}

	has(key) {
		key = key.toLowerCase();
		return this.headers.has(key);
	}

	keys() {
		return this.headers.keys();
	}

	set(key, value) {
		key = key.toLowerCase();
		this.headers.set(key, [`${value}`]);
	}

	values() {
		const values = [];
		for (const value of this.headers.values()) {
			values.push(value.join(', '));
		}

		return values;
	}
}
