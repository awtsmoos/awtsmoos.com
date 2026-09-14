//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves interactive Chromium starts with the narrow production launch contract.
 * @description
 * The browser must keep DevTools loopback-only, force web traffic through the guarded
 * relay, close direct UDP roads, and disable unrelated background browser services.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { chromeArguments } = require('./interactiveChromeLauncher.js');

test('Chromium arguments preserve proxy isolation and a quiet renderer path', () => {
	const previousHeadless = process.env.AWTSMOOS_BROWSER_HEADLESS;
	process.env.AWTSMOOS_BROWSER_HEADLESS = '1';
	try {
		const args = chromeArguments('/private/profile', 45678);
		for (const required of [
			'--remote-debugging-address=127.0.0.1',
			'--proxy-server=http://127.0.0.1:45678',
			'--proxy-bypass-list=<-loopback>',
			'--disable-background-networking',
			'--disable-component-update',
			'--disable-extensions',
			'--disable-quic',
			'--disable-sync',
			'--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
			'--headless=new'
		]) {
			assert.ok(args.includes(required), `missing ${required}`);
		}
		assert.equal(
			args.some(value => value.startsWith('--remote-allow-origins=')),
			false
		);
		assert.equal(args.at(-1), 'about:blank');
	} finally {
		if (previousHeadless == null) {
			delete process.env.AWTSMOOS_BROWSER_HEADLESS;
		} else {
			process.env.AWTSMOOS_BROWSER_HEADLESS = previousHeadless;
		}
	}
});
