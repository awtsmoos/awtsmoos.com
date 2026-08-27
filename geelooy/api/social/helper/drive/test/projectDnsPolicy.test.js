//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDnsRecord, normalizeDnsRecords } = require('../projectDnsPolicy.js');

/**
 * @file Project DNS migration-policy witnesses.
 * @description
 * The Awtsmoos lets web, mail, certificate, verification, and service records keep their distinct forms;
 * Awtsmoos.com proves a migrated zone may preserve MX, SPF/DKIM/DMARC TXT, CAA, SRV, NS, A, AAAA, and CNAME without weakening hostname boundaries.
 */

test('accepts website and mail records needed for a real provider migration', () => {
	const records = normalizeDnsRecords([
		{ type: 'A', name: '@', content: '203.0.113.10', ttl: 300 },
		{ type: 'AAAA', name: '@', content: '2001:db8::10', ttl: 300 },
		{ type: 'CNAME', name: 'www', content: 'edge.example.net.', ttl: 300 },
		{ type: 'MX', name: '@', content: '10 mail.example.net', ttl: 3600 },
		{ type: 'TXT', name: '@', content: 'v=spf1 include:_spf.example.net -all', ttl: 3600 },
		{ type: 'TXT', name: 'selector._domainkey', content: 'v=DKIM1; p=PUBLICKEY', ttl: 3600 },
		{ type: 'TXT', name: '_dmarc', content: 'v=DMARC1; p=quarantine', ttl: 3600 },
		{ type: 'CAA', name: '@', content: '0 issue letsencrypt.org', ttl: 3600 },
		{ type: 'SRV', name: '_sip._tcp', content: '10 5 5060 sip.example.net', ttl: 3600 },
		{ type: 'NS', name: 'child', content: 'ns1.example.net', ttl: 3600 }
	]);
	assert.equal(records.length, 10);
	assert.equal(records[3].content, '10 mail.example.net');
	assert.equal(records[8].name, '_sip._tcp');
});

test('keeps underscore verification owners and first-label wildcards valid', () => {
	assert.equal(normalizeDnsRecord({ type: 'TXT', name: '_awtsmoos-site', content: 'proof', ttl: 300 }).name, '_awtsmoos-site');
	assert.equal(normalizeDnsRecord({ type: 'A', name: '*.preview', content: '203.0.113.10', ttl: 300 }).name, '*.preview');
	assert.throws(
		() => normalizeDnsRecord({ type: 'TXT', name: 'preview.*', content: 'bad', ttl: 300 }),
		error => error?.code === 'PROJECT_DNS_NAME_INVALID'
	);
});

test('rejects malformed MX, SRV, CAA, NS, and CNAME targets', () => {
	const cases = [
		[{ type: 'MX', name: '@', content: 'mail.example.net', ttl: 300 }, 'PROJECT_DNS_MX_INVALID'],
		[{ type: 'MX', name: '@', content: '70000 mail.example.net', ttl: 300 }, 'PROJECT_DNS_MX_INVALID'],
		[{ type: 'SRV', name: '_sip._tcp', content: '10 5 bad sip.example.net', ttl: 300 }, 'PROJECT_DNS_SRV_INVALID'],
		[{ type: 'CAA', name: '@', content: '999 issue letsencrypt.org', ttl: 300 }, 'PROJECT_DNS_CAA_INVALID'],
		[{ type: 'NS', name: 'child', content: '_bad.example.net', ttl: 300 }, 'PROJECT_DNS_NS_INVALID'],
		[{ type: 'CNAME', name: 'www', content: '_edge.example.net', ttl: 300 }, 'PROJECT_DNS_CNAME_INVALID']
	];
	for (const [record, code] of cases) {
		assert.throws(() => normalizeDnsRecord(record), error => error?.code === code);
	}
});

test('rejects invalid names, TTLs, record types, and oversized TXT', () => {
	assert.throws(() => normalizeDnsRecord({ type: 'TXT', name: 'one..two', content: 'bad', ttl: 300 }), error => error?.code === 'PROJECT_DNS_NAME_INVALID');
	assert.throws(() => normalizeDnsRecord({ type: 'TXT', name: '@', content: 'x', ttl: 10 }), error => error?.code === 'PROJECT_DNS_TTL_INVALID');
	assert.throws(() => normalizeDnsRecord({ type: 'PTR', name: '@', content: 'example.net', ttl: 300 }), error => error?.code === 'PROJECT_DNS_TYPE_INVALID');
	assert.throws(() => normalizeDnsRecord({ type: 'TXT', name: '@', content: 'x'.repeat(2049), ttl: 300 }), error => error?.code === 'PROJECT_DNS_CONTENT_INVALID');
});
