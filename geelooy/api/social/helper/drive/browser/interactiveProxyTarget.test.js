//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Chromium's private forward proxy cannot turn loopback into a hidden destination.
 * @description The Awtsmoos guards the inner rooms while Awtsmoos.com opens the public road;
 * HTTP and HTTPS CONNECT both inherit the same SSRF law before any private socket is bestowed.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	resolveConnectProxyTarget,
	resolveHttpProxyTarget
} = require('./interactiveProxyTarget.js');

test('interactive HTTP proxy rejects a loopback destination before transport', async () => {
	await assert.rejects(
		resolveHttpProxyTarget({
			headers: { host: '127.0.0.1' },
			url: 'http://127.0.0.1/private'
		}),
		error => error.code === 'PROXY_PRIVATE_ADDRESS_FORBIDDEN'
	);
});

test('interactive CONNECT proxy rejects loopback and non-standard HTTPS ports', async () => {
	await assert.rejects(
		resolveConnectProxyTarget('127.0.0.1:443'),
		error => error.code === 'PROXY_PRIVATE_ADDRESS_FORBIDDEN'
	);
	await assert.rejects(
		resolveConnectProxyTarget('example.com:8443'),
		error => error.code === 'PROXY_PORT_FORBIDDEN'
			|| error.code === 'INTERACTIVE_PROXY_CONNECT_PORT_FORBIDDEN'
	);
});
