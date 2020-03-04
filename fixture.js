'use strict';
const {app} = require('electron');
const fetch = require('.');

app.on('window-all-closed', () => {});

(async () => {
	const response = await fetch('https://api.ipify.org');
	console.log(await response.text());

	app.quit();
})();
