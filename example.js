'use strict';
const {app} = require('electron');
const fetch = require('.');

const examples = [];

// Basic example
examples.push((async () => {
	console.log('basic example');

	const response = await fetch('https://api.ipify.org');
	console.log('my ip', await response.text());

	for (const [key, value] of response.headers.entries()) {
		console.log('header', key, value);
	}

	for (const value of response.headers.values()) {
		console.log('header value', value);
	}

	console.log('response', response);
}));

// Body used
examples.push((async () => {
	console.log('body used example');

	const response = await fetch('https://api.ipify.org');

	console.log('body used?', response.bodyUsed);
	console.log('my ip', await response.text());
	console.log('body used?', response.bodyUsed);
}));

// Body lock
examples.push((async () => {
	console.log('body lock example');

	const response = await fetch('https://api.ipify.org');
	console.log('my ip', await response.text());

	try {
		console.log('my ip', await response.text());
	} catch (error) {
		// Expected error because body was already used
		console.error(error);
	}
}));

(async () => {
	for (const example of examples) {
		console.log('=========');
		await example(); // eslint-disable-line no-await-in-loop
	}

	app.quit();
})();
