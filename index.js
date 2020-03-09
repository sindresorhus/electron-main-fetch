'use strict';
const {app, BrowserWindow} = require('electron');

let mainWindow;
let isReady = false;

module.exports = async (url, options = {}) => {
	await app.whenReady();

	if (!mainWindow) {
		mainWindow = new BrowserWindow({
			show: false,
			sandbox: true
		});

		mainWindow.loadURL('about:blank');
		await mainWindow.webContents.executeJavaScript(ProxyFetch.toString());
		await mainWindow.webContents.executeJavaScript('window.fetcher = new ProxyFetch();');
		isReady = true;
	}

	while (!isReady) { // eslint-disable-line no-unmodified-loop-condition
		await sleep(30); // eslint-disable-line no-await-in-loop
	}

	return ProxyFetch.unproxy(await mainWindow.webContents.executeJavaScript(`
		window.fetcher.fetch('${url}', JSON.parse('${JSON.stringify(options)}'));
	`, true));
};

class ProxyFetch {
	constructor() {
		this.autoincrement = 0;
		this.responses = {};
	}

	async fetch(...args) {
		const response = await fetch(...args);
		const id = this.autoincrement++;
		this.responses[id] = response;
		return this.newResponse(id, response);
	}

	newResponse(id, response) {
		const keys = [];
		const entries = [];
		const headers = {};
		const isFunction = {isFunction: true};

		for (let [key, value] of response.headers.entries()) {
			keys.push(key = key.toLowerCase());
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
				entries
			},
			blob: isFunction,
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
}

ProxyFetch.unproxy = function (response) {
	const {keys, entries, headers} = response.headers;

	response.headers = new FetchHeaders({
		keys: () => keys,
		entries: () => entries,
		get: n => headers[n.toLowerCase()],
		has: n => n.toLowerCase() in headers
	});

	for (const k in response) {
		if (response[k].isFunction) {
			response[k] = ProxyFetch.lazyCall(response.id, k);
		}
	}

	delete response.id;
	return response;
};

ProxyFetch.lazyCall = function (id, method) {
	return function (...args) {
		if (this.bodyUsed) {
			throw new Error('body stream is locked');
		}

		this.bodyUsed = true;

		return mainWindow.webContents.executeJavaScript(
			`window.fetcher.call(${id}, '${method}', ...JSON.parse('${JSON.stringify(args)}'))`
		);
	};
};

function FetchHeaders(obj) {
	for (const [k, v] of Object.entries(obj)) {
		this[k] = v;
		Object.defineProperty(this, k, {enumerable: false});
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
