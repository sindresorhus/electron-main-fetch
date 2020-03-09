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
		await example();
	}

	app.quit();
})();

/* Test example
const {app} = require('electron');
const t = require('tap');
const fetch = require('..');

app.on('window-all-closed', () => {});

(async () => {
	const response = await fetch('https://api.ipify.org');

	t.equal(response.type, 'cors');
	t.equal(response.url, 'https://api.ipify.org/');
	t.equal(response.redirected, false);
	t.equal(response.status, 200);
	t.equal(response.ok, true);
	t.equal(response.statusText, 'OK');
	t.equal(response.bodyUsed, false);
	const ip = await response.text();
	t.equal(response.bodyUsed, true);
	t.equal(ip.length > 6, true);

	const expectedHeaders = [['content-type', 'text/plain']];
	let i = 0;
	for (const [key, value] of response.headers.entries()) {
		t.equal(key, expectedHeaders[i][0]);
		t.equal(value, expectedHeaders[i][1]);
		i++;
	}

	app.quit();
	t.pass('');
})();
*/
