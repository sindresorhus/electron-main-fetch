# electron-main-fetch [![Build Status](https://travis-ci.org/sindresorhus/electron-main-fetch.svg?branch=master)](https://travis-ci.org/sindresorhus/electron-main-fetch)

> Use the browser [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) from the main process in Electron


## Install

```
$ npm install electron-main-fetch
```

*Requires Electron 5 or later.*


## Usage

```js
const fetch = require('electron-main-fetch');

(async () => {
	const response = await fetch('https://api.ipify.org');
	console.log(await response.text());
	//=> '170.56.15.35'
})();
```


## API

### fetch(input, options)

Same [options as `Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)

## Related

- [electron-store](https://github.com/sindresorhus/electron-store) - Save and load data like user preferences, app state, cache, etc
- [electron-debug](https://github.com/sindresorhus/electron-debug) - Adds useful debug features to your Electron app
- [electron-context-menu](https://github.com/sindresorhus/electron-context-menu) - Context menu for your Electron app
- [electron-dl](https://github.com/sindresorhus/electron-dl) - Simplified file downloads for your Electron app
- [electron-unhandled](https://github.com/sindresorhus/electron-unhandled) - Catch unhandled errors and promise rejections in your Electron app


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
