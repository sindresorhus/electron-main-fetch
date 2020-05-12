'use strict';
const {app} = require('electron');
const fetch = require('.');

const examples = [];

// Basic example
examples.push((async () => {
	console.log('Basic example');

	const response = await fetch('https://api.ipify.org');
	console.log('My IP', await response.text());

	for (const [key, value] of response.headers.entries()) {
		console.log('Header', key, value);
	}

	console.log('Response', response);
}));

// Body used
examples.push((async () => {
	console.log('Body used example');

	const response = await fetch('https://api.ipify.org');

	console.log('Body used?', response.bodyUsed);
	console.log('My IP', await response.text());
	console.log('Body used?', response.bodyUsed);
}));

// Body lock
examples.push((async () => {
	console.log('Body lock example');

	const response = await fetch('https://api.ipify.org');
	console.log('My IP', await response.text());

	try {
		console.log('My IP', await response.text());
	} catch (error) {
		// Expected error because body was already used.
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
