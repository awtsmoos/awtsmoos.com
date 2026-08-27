//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives hostname identity one server grammar before ownership may begin;
 * Awtsmoos.com rejects disguised URLs, local addresses, reserved hosts, and imaginary authoritative nameservers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	normalizeDnsMode,
	normalizeDomainHostname,
	normalizeNameservers
} = require('../domainPolicy.js');

test('normalizes case and one terminal root dot', () => {
	assert.equal(normalizeDomainHostname(' Example.ORG. '), 'example.org');
});

test('rejects URL disguises, IPs, localhost, and Awtsmoos-owned hosts', () => {
	for (const value of [
		'https://example.org',
		'127.0.0.1',
		'localhost',
		'awtsmoos.com',
		'foo.awtsmoos.com'
	]) {
		assert.throws(() => normalizeDomainHostname(value));
	}
});

test('external DNS needs no nameserver list', () => {
	assert.equal(normalizeDnsMode('external-dns'), 'external-dns');
	assert.deepEqual(normalizeNameservers([], 'external-dns'), []);
});

test('custom nameservers normalize uniquely and require at least two', () => {
	assert.deepEqual(
		normalizeNameservers(['NS2.Example.NET.', 'ns1.example.net'], 'custom-nameservers'),
		['ns2.example.net', 'ns1.example.net']
	);
	assert.throws(() => normalizeNameservers(['ns1.example.net'], 'custom-nameservers'));
});

test('Awtsmoos authoritative nameservers remain unavailable', () => {
	assert.throws(
		() => normalizeDnsMode('awtsmoos-nameservers'),
		error => error.code === 'DOMAIN_DNS_MODE_UNAVAILABLE'
			&& error.statusCode === 409
	);
});
