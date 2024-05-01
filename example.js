import {app} from 'electron';
import fetch from './index.js';

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
}), (async () => {
	console.log('Clone response example');

	const response1 = await fetch('https://api.ipify.org');
	const response2 = await response1.clone();

	console.log('My IP (1)', await response1.text());
	console.log('My IP (2)', await response2.text());
}), (async () => {
	console.log('Body used example');

	const response = await fetch('https://api.ipify.org');

	console.log('Body used?', response.bodyUsed);
	console.log('My IP', await response.text());
	console.log('Body used?', response.bodyUsed);
}), (async () => {
	console.log('Body lock example');

	const response = await fetch('https://api.ipify.org');
	console.log('My IP', await response.text());

	try {
		console.log('My IP', await response.text());
	} catch (error) {
		// Expected error because body was already used.
		console.error('Expected error:', error);
	}
}));

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
	for (const example of examples) {
		console.log('=========');
		await example(); // eslint-disable-line no-await-in-loop
	}

	app.quit();
})();
