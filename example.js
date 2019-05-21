'use strict';
const {app} = require('electron');
const fetch = require('.');

app.on('window-all-closed', () => {});

(async () => {
	console.log('Your IP:', await fetch('https://api.ipify.org', {type: 'text'}));
	app.quit();
})();
