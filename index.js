'use strict';
const electron = require('electron');
const util = require('electron-util');

module.exports = async (url, options) => {
	await util.appReady;

	options = Object.assign({
		type: 'json'
	}, options);

	const type = options.type;
	delete options.type;

	const win = new electron.BrowserWindow({
		show: false,
		sandbox: true,
		nodeIntegration: false,
		contextIsolation: true
	});

	win.loadURL('about:blank');

	const ret = await win.webContents.executeJavaScript(`
		fetch('${url}', JSON.parse('${JSON.stringify(options)}')).then(x => x.${type}())
	`, true);

	win.destroy();

	return ret;
};
