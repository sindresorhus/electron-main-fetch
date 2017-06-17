'use strict';
const electron = require('electron');
const fetch = require('.');

electron.app.on('window-all-closed', () => {});

(async () => {
	const r1 = await fetch('https://api.ipify.org');
	const r2 = await fetch('http://date.jsontest.com')
	console.log('Your IP:', await r1.text());
	console.log('Current date:', await r2.json());
	electron.app.quit();
})();
