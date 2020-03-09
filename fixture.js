'use strict';
const {app} = require('electron');
const fetch = require('.');

(async () => {
	const response = await fetch('https://api.ipify.org');
	console.log(await response.text());

	app.quit();
})();
