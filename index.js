'use strict';
const {app, BrowserWindow} = require('electron');

let win;
let isReady = false;

module.exports = async (url, options = {}) => {
	await app.whenReady();

	if (!win) {
		win = new BrowserWindow({
			show: false,
			sandbox: true
		});

		win.loadURL('about:blank');
		await win.webContents.executeJavaScript(ProxyFetch.toString());
		await win.webContents.executeJavaScript('window.proxyFetcher = new ProxyFetch();');
		isReady = true;
	}

	while (!isReady) { // eslint-disable-line no-unmodified-loop-condition
		await delay(30); // eslint-disable-line no-await-in-loop
	}

	return ProxyFetch.unproxy(await win.webContents.executeJavaScript(`
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
		const keys = [];
		const values = [];
		const entries = [];
		const headers = {};
		const isFunction = {isFunction: true};

		for (let [key, value] of response.headers.entries()) {
			key = key.toLowerCase();
			keys.push(key);
			values.push(value);
			entries.push([key, value]);
			headers[key] = headers[key] ? `${headers[key]},${value}` : value;
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
			headers: {
				headers,
				keys,
				entries,
				values
			},
			json: isFunction,
			text: isFunction
		};
	}

	call(id, method, ...args) {
		const response = this.responses[id];
		if (!response) {
			throw new Error('Could not find response');
		}

		delete this.responses[id];
		return response[method](...args);
	}

	static unproxy(response) {
		const {keys, entries, values, headers} = response.headers;

		response.headers = new FetchHeaders({
			keys: () => keys,
			entries: () => entries,
			values: () => values,
			get: name => headers[name.toLowerCase()],
			has: name => name.toLowerCase() in headers
		});

		for (const key of Object.keys(response)) {
			if (response[key].isFunction) {
				response[key] = ProxyFetch.lazyCall(response.id, key);
			}
		}

		delete response.id;
		return response;
	}

	static lazyCall(id, method) {
		return function (...args) {
			if (this.bodyUsed) {
				throw new Error('body stream is locked');
			}

			this.bodyUsed = true;

			return win.webContents.executeJavaScript(
				`window.proxyFetcher.call(${id}, '${method}', ...JSON.parse('${JSON.stringify(args)}'))`
			);
		};
	}
}

function FetchHeaders(obj) {
	for (const [property, value] of Object.entries(obj)) {
		this[property] = value;
		Object.defineProperty(this, property, {enumerable: false});
	}
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
