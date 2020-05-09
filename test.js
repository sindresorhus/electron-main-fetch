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

t.test('main w/text', async t => {
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

	const expectedHeaders = [['content-type', 'text/plain']];
	let i = 0;
	for (const [key, value] of response.headers.entries()) {
		t.equal(key, expectedHeaders[i][0]);
		t.equal(value, expectedHeaders[i][1]);
		i++;
	}

	i = 0;
	for (const value of response.headers.values()) {
		t.equal(value, expectedHeaders[i][1]);
		i++;
	}

	try {
		await response.text();
		t.fail('should have thrown an error due body already used');
	} catch (error) {
		t.equal(error.message, 'body stream is locked');
	}
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

t.teardown(() => {
	app.quit();
});
