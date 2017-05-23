'use strict';
const electron = require('electron');
const fetch = require('.');

(async () => {
	console.log((await fetch('http://echo.jsontest.com/foo/bar')).foo);
})();
