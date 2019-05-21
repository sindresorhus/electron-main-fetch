'use strict';
const fetch = require('.');

(async () => {
	console.log(await fetch('https://api.ipify.org', {type: 'text'}));
})();
