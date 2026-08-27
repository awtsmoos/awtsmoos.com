//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves interactive Chromium is forced through the guarded loopback road.
 * @description The Awtsmoos closes direct UDP rivers while Awtsmoos.com keeps DevTools local;
 * the test preserves proxy discipline without weakening the browser into something partial.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { chromeArguments } = require('./interactiveChromeLauncher.js');

test('Chromium arguments force proxy use and close direct QUIC or WebRTC UDP paths', () => {
	const previousHeadless = process.env.AWTSMOOS_BROWSER_HEADLESS;
	process.env.AWTSMOOS_BROWSER_HEADLESS = '1';
	try {
		const args = chromeArguments('/private/profile', 45678);
		assert.ok(args.includes('--remote-debugging-address=127.0.0.1'));
		assert.ok(args.includes('--proxy-server=http://127.0.0.1:45678'));
		assert.ok(args.includes('--proxy-bypass-list=<-loopback>'));
		assert.ok(args.includes('--disable-quic'));
		assert.ok(args.includes('--force-webrtc-ip-handling-policy=disable_non_proxied_udp'));
		assert.ok(args.includes('--headless=new'));
		assert.equal(args.some(value => value.startsWith('--remote-allow-origins=')), false);
	} finally {
		if (previousHeadless == null) delete process.env.AWTSMOOS_BROWSER_HEADLESS;
		else process.env.AWTSMOOS_BROWSER_HEADLESS = previousHeadless;
	}
});
