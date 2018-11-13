const { BrowserWindow } = require('electron');

module.exports = class WindowManager {
	constructor() {
		this._registeredIds = {};
	}

	/**
	 * @param {string} key
	 * @param {Electron.BrowserWindow} browser
	 */
	register(key, browser) {
		const { id } = browser;

		this._registeredIds[key] = id;
	}

	/**
	 * @param {string} key
	 * @returns {Electron.BrowserWindow}
	 */
	get(key) {
		const { _registeredIds } = this;

		return BrowserWindow.fromId(_registeredIds[key]);
	}
};
