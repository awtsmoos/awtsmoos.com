//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeProjectConfig } = require('../projectConfigPolicy.js');

/**
 * @file Project automation policy witnesses.
 * @description
 * The Awtsmoos lets public project intention endure while hidden authority remains beyond the portable vessel;
 * Awtsmoos.com proves DNS, provider handles, and timestamps survive normalization while raw secrets are refused.
 */

test('project config persists DNS records and opaque provider bindings', () => {
	const project = normalizeProjectConfig('site-one', {
		name: 'Site One',
		rootPath: 'sites/site-one',
		providerIntents: [
			{ kind: 'git', provider: 'github', id: 'owner/repo', mode: 'sync' },
			{ kind: 'domain', provider: 'cloudflare', id: 'example.com', mode: 'dns' }
		],
		providerBindings: [
			{ kind: 'git', provider: 'github', binding: 'GITHUB_PRIMARY' },
			{ kind: 'domain', provider: 'cloudflare', binding: 'CLOUDFLARE_MAIN' }
		],
		dnsRecords: [
			{ type: 'A', name: '@', content: '203.0.113.10', ttl: 300 },
			{ type: 'CNAME', name: 'www', content: 'edge.example.net', ttl: 600 }
		]
	}, null, '2026-01-01T00:00:00.000Z');
	assert.equal(project.providerBindings.length, 2);
	assert.equal(project.providerBindings[0].binding, 'GITHUB_PRIMARY');
	assert.equal(project.dnsRecords.length, 2);
	assert.equal(project.dnsRecords[1].type, 'CNAME');
});

test('project config preserves portable automation state across partial updates', () => {
	const created = normalizeProjectConfig('site-one', {
		providerBindings: [{ kind: 'git', provider: 'github', binding: 'GITHUB_PRIMARY' }],
		dnsRecords: [{ type: 'TXT', name: '_awtsmoos', content: 'alive', ttl: 300 }]
	}, null, '2026-01-01T00:00:00.000Z');
	const updated = normalizeProjectConfig(
		'site-one',
		{ name: 'Renamed Site' },
		created,
		'2026-02-01T00:00:00.000Z'
	);
	assert.equal(updated.createdAt, created.createdAt);
	assert.equal(updated.updatedAt, '2026-02-01T00:00:00.000Z');
	assert.deepEqual(updated.providerBindings, created.providerBindings);
	assert.deepEqual(updated.dnsRecords, created.dnsRecords);
});

test('project config recursively rejects raw secret-shaped fields', () => {
	for (const input of [
		{ githubToken: 'never' },
		{ provider: { apiKey: 'never' } },
		{ nested: [{ privateKey: 'never' }] },
		{ cloud: { clientSecret: 'never' } }
	]) {
		assert.throws(
			() => normalizeProjectConfig('secret-test', input),
			error => error?.code === 'PROJECT_CREDENTIAL_FIELD_FORBIDDEN'
		);
	}
});

test('provider binding handles reject malformed credential-like values', () => {
	assert.throws(
		() => normalizeProjectConfig('site-one', {
			providerBindings: [{ kind: 'git', provider: 'github', binding: 'raw-token-value' }]
		}),
		error => error?.code === 'PROJECT_PROVIDER_BINDING_NAME_INVALID'
	);
});
