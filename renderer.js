module.exports = class RemoteFetchStore {
	constructor() {
		this._responses = {};
	}

	async fetch(id, ...args) {
		const response = await fetch(...args);
		this._responses[id] = response;
		const responseProxy = {};
		for (const key of Object.keys(response.__proto__)) {
			if (typeof response[key] === 'function') {
				responseProxy[key] = { proxy_fn: true }
			} else {
				responseProxy[key] = response[key];
			}
		}
		responseProxy._id = id;
		return responseProxy;
	}

	async runMethod(id, methodName, ...args) {
		if (!this._responses[id]) {
			throw new Error('Could not find response');
		}
		return await this._responses[id][methodName](...args);
	}
};
