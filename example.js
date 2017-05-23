'use strict';
const electron = require('electron');
const fetch = require('.');

electron.app.on('window-all-closed', () => {});

(async () => {
	console.log('Your IP:', await fetch('https://api.ipify.org', {type: 'text'}));
	console.log('Current date:', (await fetch('http://date.jsontest.com')).date);
	electron.app.quit();
})();
