'use strict';
const {app} = require('electron');
const t = require('tap');
const isIp = require('is-ip');
const fetch = require('.');

t.test('double fetch without await', async () => {
	const promise1 = fetch('https://api.ipify.org');
	const promise2 = fetch('https://api.ipify.org');

	const response1 = await promise1;
	const response2 = await promise2;

	await response1.text();
	await response2.text();
});

t.test('main with text', async t => {
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
	t.equal(isIp(ip), true);

	try {
		await response.text();
		t.fail('should have thrown an error due body already used');
	} catch (error) {
		t.equal(error.message, 'body stream is locked');
	}
});

t.test('headers', async t => {
	const {headers} = await fetch('https://api.ipify.org');

	t.equal(headers.has('content-type'), true);
	t.equal(headers.get('content-type'), 'text/plain');

	for (const [key, value] of headers.entries()) {
		t.equal(key, 'content-type');
		t.equal(value, 'text/plain');
		break;
	}

	for (const key of headers.keys()) {
		t.equal(key, 'content-type');
		break;
	}

	for (const value of headers.values()) {
		t.equal(value, 'text/plain');
		break;
	}

	t.equal(headers.has('x-not-exists'), false);
	t.equal(headers.get('x-not-exists'), null);
	t.equal(headers.set('x-not-exists'), undefined);
	t.equal(headers.get('x-not-exists'), 'undefined');
	headers.delete('x-not-exists');
	t.equal(headers.has('x-not-exists'), false);
});

t.test('json', async t => {
	const response = await fetch('https://api.ipify.org/?format=json');

	const data = await response.json();
	t.equal(typeof data, 'object');
	t.equal(isIp(data.ip), true);
});

t.test('arrayBuffer', async t => {
	const response = await fetch('https://api.ipify.org/?format=json');

	const data = await response.arrayBuffer();
	t.equal(typeof data, 'object');
	const json = JSON.parse(Buffer.from(data));
	t.equal(isIp(json.ip), true);
});

t.test('clone', async t => {
	const response1 = await fetch('https://api.ipify.org');
	const response2 = await response1.clone();

	t.equal(response1.bodyUsed, false);
	t.equal(response2.bodyUsed, false);

	await response1.text();

	t.equal(response1.bodyUsed, true);
	t.equal(response2.bodyUsed, false);

	await response2.text();

	t.equal(response1.bodyUsed, true);
	t.equal(response2.bodyUsed, true);
});

t.teardown(() => {
	app.quit();
});
