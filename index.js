'use strict';
const electron = require('electron');
const util = require('electron-util');

const RemoteFetchStore = require('./renderer');

const unproxyResponse = (proxyResponse, window) => {
	let id = proxyResponse._id;
	delete proxyResponse._id;
	for (const key of Object.keys(proxyResponse)) {
		if (proxyResponse[key].proxy_fn === true) {
			proxyResponse[key] = async (...args) => {
				const response = await window.webContents.executeJavaScript(
					`window.fetcher.runMethod(${id}, '${key}', ...JSON.parse('${JSON.stringify(args)}'))`
				);
				return response;
			};
		}
	}
	return proxyResponse;
};

let win;
let fetchID = 1;

module.exports = async (url, options) => {
	await util.appReady;

	options = Object.assign({
		type: 'json',
	}, options);

	const type = options.type;
	delete options.type;

	if (!win) {
		win = new electron.BrowserWindow({
			show: false,
			sandbox: true,
			nodeIntegration: false,
			contextIsolation: true
		});
		win.loadURL('about:blank');
		await win.webContents.executeJavaScript(RemoteFetchStore.toString());
		await win.webContents.executeJavaScript('window.fetcher = new RemoteFetchStore()');
	}

	const ret = unproxyResponse(await win.webContents.executeJavaScript(`
		window.fetcher.fetch(${fetchID++}, '${url}', JSON.parse('${JSON.stringify(options)}'))
	`, true), win);

	return ret;
};
