# electron-main-fetch [![Build Status](https://travis-ci.org/sindresorhus/electron-main-fetch.svg?branch=master)](https://travis-ci.org/sindresorhus/electron-main-fetch)

> Use the browser [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) from the main process in Electron

**Proof of concept. Comments welcome.**


## Install

```
$ npm install electron-main-fetch
```


## Usage

The difference between this and `Fetch` is that instead of receiving a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object and calling a method on it for what type to receive, you just specify the type in the function call.

```js
const fetch = require('electron-main-fetch');

(async () => {
	const ip = await fetch('https://api.ipify.org', {type: 'text'});
	console.log(ip);
	//=> '170.56.15.35'
})();
```

With `Fetch` in the renderer process, the above would instead be:

```js
(async () => {
	const ip = await fetch('https://api.ipify.org').then(response => response.text());
	console.log(ip);
	//=> '170.56.15.35'
})();
```


## API

### fetch(input, options)

Same [options as `Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters), but also:

#### type

Type: `string`<br>
Values: [`json`](https://developer.mozilla.org/en-US/docs/Web/API/Body/json) [`text`](https://developer.mozilla.org/en-US/docs/Web/API/Body/text) [`formData`](https://developer.mozilla.org/en-US/docs/Web/API/Body/formData) [`blob`](https://developer.mozilla.org/en-US/docs/Web/API/Body/blob) [`arrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/Body/arrayBuffer)<br>
Default: `json`


## Related

- [electron-store](https://github.com/sindresorhus/electron-store) - Save and load data like user preferences, app state, cache, etc
- [electron-debug](https://github.com/sindresorhus/electron-debug) - Adds useful debug features to your Electron app
- [electron-context-menu](https://github.com/sindresorhus/electron-context-menu) - Context menu for your Electron app
- [electron-dl](https://github.com/sindresorhus/electron-dl) - Simplified file downloads for your Electron app
- [electron-unhandled](https://github.com/sindresorhus/electron-unhandled) - Catch unhandled errors and promise rejections in your Electron app


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
