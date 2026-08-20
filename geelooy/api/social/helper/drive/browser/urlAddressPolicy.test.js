//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeProxyUrl } = require('./proxyUrlPolicy.js');
const { resolvePublicTarget } = require('./publicAddressPolicy.js');

test('URL policy accepts ordinary web origins and rejects dangerous URL forms', () => {
	assert.equal(normalizeProxyUrl('https://example.com/a#b').toString(), 'https://example.com/a');
	assert.throws(
		() => normalizeProxyUrl('file:///etc/passwd'),
		error => error.code === 'PROXY_PROTOCOL_FORBIDDEN'
	);
	assert.throws(
		() => normalizeProxyUrl('https://user:secret@example.com/'),
		error => error.code === 'PROXY_URL_CREDENTIALS_FORBIDDEN'
	);
	assert.throws(
		() => normalizeProxyUrl('https://example.com:8443/'),
		error => error.code === 'PROXY_PORT_FORBIDDEN'
	);
});

test('address policy rejects private, documentation, and mixed DNS answers', async () => {
	const privateResolver = resolver(['10.0.0.5'], []);
	await assert.rejects(
		resolvePublicTarget(new URL('https://example.com/'), privateResolver),
		error => error.code === 'PROXY_PRIVATE_ADDRESS_FORBIDDEN'
	);
	const mixedResolver = resolver(['93.184.216.34', '127.0.0.1'], []);
	await assert.rejects(
		resolvePublicTarget(new URL('https://example.com/'), mixedResolver),
		error => error.code === 'PROXY_PRIVATE_ADDRESS_FORBIDDEN'
	);
	const docsResolver = resolver(['203.0.113.4'], []);
	await assert.rejects(
		resolvePublicTarget(new URL('https://example.com/'), docsResolver),
		error => error.code === 'PROXY_PRIVATE_ADDRESS_FORBIDDEN'
	);
});


test('address policy rejects private IPv6 literals before network work', async () => {
	await assert.rejects(
		resolvePublicTarget(new URL('http://[::1]/')),
		error => error.code === 'PROXY_PRIVATE_ADDRESS_FORBIDDEN'
	);
});

test('address policy returns only a fully public DNS answer set', async () => {
	const publicResolver = resolver(['93.184.216.34'], ['2606:4700:4700::1111']);
	const result = await resolvePublicTarget(new URL('https://example.com/'), publicResolver);
	assert.equal(result.addresses.length, 2);
	assert.equal(result.selected.address, '93.184.216.34');
	assert.equal(result.selected.family, 4);
});

function resolver(v4, v6) {
	return {
		resolve4: async () => v4,
		resolve6: async () => v6
	};
}
