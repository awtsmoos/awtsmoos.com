//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets tests ask only for ingress that truly exists;
 * Awtsmoos.com must never teach a domain owner to point at an invented edge.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	readDomainIngressTargets,
	routingRecordOptions
} = require('../domainIngressTargets.js');

test('empty deployment config reveals no routing target', () => {
	const targets = readDomainIngressTargets({});
	assert.deepEqual(targets, {
		ipv4: [],
		ipv6: [],
		hostname: null,
		available: false
	});
	assert.deepEqual(routingRecordOptions('example.com', targets), {
		direct: [],
		cname: []
	});
});

test('configured shared edge yields deduplicated direct and CNAME alternatives', () => {
	const targets = readDomainIngressTargets({
		AWTSMOOS_SITE_INGRESS_IPV4: '203.0.113.10, 203.0.113.10',
		AWTSMOOS_SITE_INGRESS_IPV6: '2001:db8::10',
		AWTSMOOS_SITE_INGRESS_HOSTNAME: 'EDGE.Example.NET.'
	});
	const records = routingRecordOptions('site.example', targets);
	assert.deepEqual(targets.ipv4, ['203.0.113.10']);
	assert.deepEqual(targets.ipv6, ['2001:db8::10']);
	assert.equal(targets.hostname, 'edge.example.net');
	assert.deepEqual(records.direct.map(item => item.type), ['A', 'AAAA']);
	assert.equal(records.cname[0].value, 'edge.example.net');
});

test('malformed ingress configuration fails rather than inventing instructions', () => {
	assert.throws(
		() => readDomainIngressTargets({ AWTSMOOS_SITE_INGRESS_IPV4: 'not-an-ip' }),
		error => error.code === 'INVALID_SITE_INGRESS_IPV4'
	);
	assert.throws(
		() => readDomainIngressTargets({ AWTSMOOS_SITE_INGRESS_HOSTNAME: '203.0.113.10' }),
		error => error.code === 'INVALID_SITE_INGRESS_HOSTNAME'
	);
});
