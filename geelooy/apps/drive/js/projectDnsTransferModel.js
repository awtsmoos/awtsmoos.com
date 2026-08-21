//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectDnsTransferModel
 * @description
 * The Awtsmoos lets a zone travel as portable intention while Awtsmoos.com refuses to confuse a saved worksheet with live authoritative DNS;
 * rows stay structured so mail and service content may contain spaces without brittle token splitting, and the server remains final validation authority.
 */

export const DNS_RECORD_TYPES = Object.freeze([
	'A',
	'AAAA',
	'CNAME',
	'TXT',
	'MX',
	'CAA',
	'SRV',
	'NS'
]);

const DNS_TYPE_SET = new Set(DNS_RECORD_TYPES);

export function dnsRecordsFromPlan(plan) {
	return Array.from(plan?.configuration?.dnsRecords || []).map(normalizeDnsDraftRecord);
}

export function normalizeDnsDraftRecord(value = {}) {
	const type = String(value.type || 'A').trim().toUpperCase();
	const name = String(value.name || '@').trim();
	const content = String(value.content || '').trim();
	const ttl = Number(value.ttl ?? 300);
	if (!DNS_TYPE_SET.has(type)) {
		throw new Error(`Unsupported DNS type: ${type || 'empty'}`);
	}
	if (!name || !content) {
		throw new Error('DNS name and content are required.');
	}
	if (!Number.isInteger(ttl) || ttl < 60 || ttl > 86400) {
		throw new Error('DNS TTL must be an integer from 60 through 86400.');
	}
	return { type, name, content, ttl };
}

export function parseDnsTransferText(value) {
	const source = String(value || '').trim();
	if (!source) {
		return [];
	}
	if (source.startsWith('[')) {
		const parsed = JSON.parse(source);
		if (!Array.isArray(parsed)) {
			throw new Error('DNS JSON import must be an array.');
		}
		return parsed.map(normalizeDnsDraftRecord);
	}
	return source
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && !line.startsWith('#'))
		.filter(line => !/^type[\t|]/i.test(line))
		.map(parsePortableLine);
}

export function serializeDnsTransferText(records = []) {
	const lines = ['TYPE\tNAME\tTTL\tCONTENT'];
	for (const value of records) {
		const record = normalizeDnsDraftRecord(value);
		lines.push([record.type, record.name, record.ttl, record.content].join('\t'));
	}
	return lines.join('\n');
}

function parsePortableLine(line) {
	const delimiter = line.includes('\t') ? '\t' : '|';
	const fields = line.split(delimiter);
	if (fields.length < 4) {
		throw new Error('DNS import lines need TYPE, NAME, TTL, and CONTENT columns.');
	}
	return normalizeDnsDraftRecord({
		type: fields.shift(),
		name: fields.shift(),
		ttl: fields.shift(),
		content: fields.join(delimiter)
	});
}
