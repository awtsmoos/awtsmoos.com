//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves Host identity is classified before tenant paths gain meaning. */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	canonicalRequestHost,
	isPlatformRequestHost
} = require('../requestHostPolicy.js');

test('platform hosts include Awtsmoos, loopback development, and explicit additions', () => {
	assert.equal(canonicalRequestHost('Awtsmoos.COM.:443'), 'awtsmoos.com');
	assert.equal(isPlatformRequestHost('awtsmoos.com'), true);
	assert.equal(isPlatformRequestHost('api.awtsmoos.com:443'), true);
	assert.equal(isPlatformRequestHost('localhost:8080'), true);
	assert.equal(isPlatformRequestHost('studio.localhost'), true);
	assert.equal(isPlatformRequestHost('127.0.0.1:8080'), true);
	assert.equal(isPlatformRequestHost('[::1]:8080'), true);
	assert.equal(isPlatformRequestHost('preview.internal', ['preview.internal']), true);
});

test('ordinary external names and public IPs require tenant authority', () => {
	assert.equal(canonicalRequestHost('My-Site.Example.:443'), 'my-site.example');
	assert.equal(isPlatformRequestHost('my-site.example'), false);
	assert.equal(isPlatformRequestHost('203.0.113.10'), false);
	assert.equal(isPlatformRequestHost('[2001:db8::10]'), false);
	assert.equal(isPlatformRequestHost('preview.internal'), false);
});

test('malformed Host values never become platform authority', () => {
	for (const value of [
		'bad host.example',
		'example.com/path',
		'example.com?x=1',
		'[not-ipv6]:443',
		'example.com:abc'
	]) {
		assert.equal(canonicalRequestHost(value), null);
		assert.equal(isPlatformRequestHost(value), false);
	}
});
