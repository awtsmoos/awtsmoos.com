//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets public DNS testify through injected witnesses while one-way registry proof remains secret-free;
 * Awtsmoos.com distinguishes exact TXT proof, absence, resolver failure, and nameserver delegation without activating routing.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	createDomainChallenge,
	hashDomainChallenge
} = require('../domainChallenge.js');
const {
	verifyDomainTxt,
	verifyNameserverDelegation
} = require('../domainVerification.js');

test('verifies split TXT fragments against stored one-way proof', async () => {
	const token = createDomainChallenge();
	const result = await verifyDomainTxt({
		hostname: 'example.org',
		challengeHash: hashDomainChallenge(token),
		resolveTxt: async () => [[
			'awtsmoos-verification=',
			token
		]]
	});
	assert.equal(result.verified, true);
	assert.equal(result.errorCode, null);
});

test('wrong proof remains unverified', async () => {
	const result = await verifyDomainTxt({
		hostname: 'example.org',
		challengeHash: hashDomainChallenge(createDomainChallenge()),
		resolveTxt: async () => [[`awtsmoos-verification=${createDomainChallenge()}`]]
	});
	assert.equal(result.verified, false);
	assert.equal(result.transient, false);
});

test('distinguishes absent DNS from transient resolver failure', async () => {
	const absent = await verifyDomainTxt({
		hostname: 'example.org',
		challengeHash: '0'.repeat(64),
		resolveTxt: async () => {
			const error = new Error('missing');
			error.code = 'ENOTFOUND';
			throw error;
		}
	});
	const transient = await verifyDomainTxt({
		hostname: 'example.org',
		challengeHash: '0'.repeat(64),
		resolveTxt: async () => {
			throw new Error('timeout');
		}
	});
	assert.deepEqual([absent.errorCode, absent.transient], ['DNS_RECORD_NOT_FOUND', false]);
	assert.deepEqual([transient.errorCode, transient.transient], ['DNS_RESOLVER_ERROR', true]);
});

test('delegation requires the exact normalized nameserver set', async () => {
	const result = await verifyNameserverDelegation({
		hostname: 'example.org',
		requestedNameservers: ['ns1.example.net', 'ns2.example.net'],
		resolveNs: async () => ['NS2.Example.NET.', 'ns1.example.net']
	});
	assert.equal(result.verified, true);
	assert.deepEqual(result.observedNameservers, ['ns1.example.net', 'ns2.example.net']);
});
