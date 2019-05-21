'use strict';
const {app, BrowserWindow} = require('electron');

module.exports = async (url, {type = 'json', ...options} = {}) => {
	await app.whenReady();

	const mainWindow = new BrowserWindow({
		show: false,
		sandbox: true
	});

	await mainWindow.loadURL('about:blank');

	const result = await mainWindow.webContents.executeJavaScript(`
		fetch('${url}', JSON.parse('${JSON.stringify(options)}')).then(x => x.${type}())
	`, true);

	mainWindow.destroy();

	return result;
};
