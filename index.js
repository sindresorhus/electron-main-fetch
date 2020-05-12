'use strict';
const {app, BrowserWindow} = require('electron');
const bufferToArrayBuffer = require('buffer-to-arraybuffer');

let window_;
let windowLoad;

module.exports = async (url, options = {}) => {
	await app.whenReady();

	if (!window_) {
		window_ = new BrowserWindow({
			show: false,
			sandbox: true
		});

		window_.loadURL('about:blank');
		windowLoad = window_.webContents.executeJavaScript(
			ProxyFetch.toString() +
			'window.proxyFetcher = new ProxyFetch();'
		);
	}

	await windowLoad;

	return ProxyFetch.unproxy(await window_.webContents.executeJavaScript(`
		window.proxyFetcher.fetch('${url}', JSON.parse('${JSON.stringify(options)}'));
	`, true));
};

class ProxyFetch {
	constructor() {
		this.autoIncrementId = 0;
		this.responses = {};
	}

	async fetch(...args) {
		const response = await fetch(...args);
		const id = this.autoIncrementId++;
		this.responses[id] = response;
		return this.newResponse(id, response);
	}

	newResponse(id, response) {
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
			arrayBuffer: isFunction,
			json: isFunction,
			text: isFunction
		};
	}

	call(id, method, ...args) {
		const response = this.responses[id];
		if (!response) {
			throw new Error('Could not find response');
		}

		if (method === 'arrayBuffer') {
			method = 'text';
		}

		delete this.responses[id];
		return response[method](...args);
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
		return async function (...args) {
			if (this.bodyUsed) {
				throw new Error('body stream is locked');
			}

			this.bodyUsed = true;

			let result = await window_.webContents.executeJavaScript(
				`window.proxyFetcher.call(${id}, '${method}', ...JSON.parse('${JSON.stringify(args)}'))`
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
		this.headers = {};
		for (const [key, value] of headers) {
			this.append(key, value);
		}

		Object.defineProperty(this, 'headers', {enumerable: false});
	}

	append(key, value) {
		key = key.toLowerCase();
		if (!this.headers[key]) {
			this.headers[key] = [];
		}

		this.headers[key].push(`${value}`);
	}

	delete(key) {
		key = key.toLowerCase();
		delete this.headers[key];
	}

	entries() {
		const entries = [];
		for (const key of Object.keys(this.headers)) {
			entries.push([key, this.headers[key].join(', ')]);
		}

		return entries;
	}

	get(key) {
		key = key.toLowerCase();
		if (typeof this.headers[key] === 'undefined') {
			return null;
		}

		return this.headers[key].join(', ');
	}

	has(key) {
		key = key.toLowerCase();
		return typeof this.headers[key] !== 'undefined';
	}

	keys() {
		const keys = [];
		for (const key of Object.keys(this.headers)) {
			keys.push(key);
		}

		return keys;
	}

	set(key, value) {
		key = key.toLowerCase();
		this.headers[key] = [`${value}`];
	}

	values() {
		const values = [];
		for (const value of Object.values(this.headers)) {
			values.push(value.join(', '));
		}

		return values;
	}
}
