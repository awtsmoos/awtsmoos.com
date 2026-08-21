//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	parseDnsTransferText,
	serializeDnsTransferText
} from '../js/projectDnsTransferModel.js';

/**
 * @file Portable DNS worksheet witnesses.
 * @description
 * The Awtsmoos lets mail, service, certificate, and web records travel without losing spaces inside their content;
 * Awtsmoos.com proves JSON, tab, and pipe worksheets become the same structured intention before server validation gives the final consent.
 */

test('tab worksheet preserves MX, TXT, SRV, and CAA content containing spaces', () => {
	const records = parseDnsTransferText([
		'TYPE\tNAME\tTTL\tCONTENT',
		'MX\t@\t3600\t10 mail.example.net',
		'TXT\t@\t3600\tv=spf1 include:_spf.example.net -all',
		'SRV\t_sip._tcp\t300\t10 5 5060 sip.example.net',
		'CAA\t@\t300\t0 issue letsencrypt.org'
	].join('\n'));
	assert.equal(records.length, 4);
	assert.equal(records[0].content, '10 mail.example.net');
	assert.equal(records[1].content, 'v=spf1 include:_spf.example.net -all');
	assert.equal(records[2].content, '10 5 5060 sip.example.net');
});

test('pipe worksheet joins remaining columns back into record content', () => {
	const [record] = parseDnsTransferText('TXT|_dmarc|3600|v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com');
	assert.equal(record.name, '_dmarc');
	assert.match(record.content, /p=quarantine/);
});

test('JSON import and worksheet export round trip structured records', () => {
	const records = parseDnsTransferText(JSON.stringify([
		{ type: 'NS', name: 'child', ttl: 3600, content: 'ns1.example.net' },
		{ type: 'AAAA', name: '@', ttl: 300, content: '2001:db8::10' }
	]));
	const exported = serializeDnsTransferText(records);
	assert.deepEqual(parseDnsTransferText(exported), records);
});

test('draft validation refuses unknown types, missing content, and unsafe TTL ranges', () => {
	assert.throws(() => parseDnsTransferText('PTR\t@\t300\texample.net'), /Unsupported DNS type/);
	assert.throws(() => parseDnsTransferText('A\t@\t300\t'), /columns|content/i);
	assert.throws(() => parseDnsTransferText('A\t@\t10\t203.0.113.10'), /TTL/);
});
