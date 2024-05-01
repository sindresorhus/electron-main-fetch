import {app} from 'electron';
import t from 'tap';
import {isIP} from 'is-ip';
import fetch from './index.js';

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
	t.equal(response.statusText, '');
	t.equal(response.bodyUsed, false);
	const ip = await response.text();
	t.equal(response.bodyUsed, true);
	t.equal(isIP(ip), true);

	try {
		await response.text();
		t.fail('should have thrown an error due body already used');
	} catch (error) {
		t.equal(error.message, 'body stream is locked');
	}
});

t.test('headers', async t => {
	const {headers} = await fetch('https://api.ipify.org');

	// Directly check for the presence and value of 'content-type'
	t.equal(headers.has('content-type'), true, 'Check content-type is present');
	t.equal(headers.get('content-type'), 'text/plain', 'Check content-type value is \'text/plain\'');

	// Assert non-existent header to check behavior
	t.equal(headers.has('x-not-exists'), false, 'Check non-existent header is not present');
	t.equal(headers.get('x-not-exists'), null, 'Check non-existent header returns null');

	// Headers modification is typically not supported directly via fetch API, but if testing in a context where this is possible:
	headers.set('x-not-exists', 'undefined');
	t.equal(headers.get('x-not-exists'), 'undefined', 'Check set operation on non-existent header');
	headers.delete('x-not-exists');
	t.equal(headers.has('x-not-exists'), false, 'Check deletion of non-existent header');

	// Handling multiple values for the same header
	headers.append('x-values', 'one');
	headers.append('x-values', 'two');
	headers.append('x-values', 'three');
	t.equal(headers.get('x-values'), 'one, two, three', 'Check multiple values for \'x-values\' header');
});

t.test('json', async t => {
	const response = await fetch('https://api.ipify.org/?format=json');

	const data = await response.json();
	t.equal(typeof data, 'object');
	t.equal(isIP(data.ip), true);
});

t.test('arrayBuffer', async t => {
	const response = await fetch('https://api.ipify.org/?format=json');

	const data = await response.arrayBuffer();
	t.equal(typeof data, 'object');
	const json = JSON.parse(Buffer.from(data));
	t.equal(isIP(json.ip), true);
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
