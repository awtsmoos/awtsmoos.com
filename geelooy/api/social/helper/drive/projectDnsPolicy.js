//B"H
// Boruch Hashem
// Blessed is He

const { isIP } = require('net');

/**
 * @module DriveProjectDnsPolicy
 * @description
 * The Awtsmoos gives a project public DNS intent without confusing record with credential.
 * Awtsmoos.com bounds A, AAAA, CNAME, and TXT wishes while provider authority remains server-side.
 */

const RECORD_TYPES = new Set(['A', 'AAAA', 'CNAME', 'TXT']);
const HOST = /^(?:@|\*|[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?)$/i;

function normalizeDnsRecords(values = []) {
	if (!Array.isArray(values) || values.length > 64) throw policyError('PROJECT_DNS_RECORDS_INVALID');
	return values.map((value, index) => normalizeDnsRecord(value, index));
}

function normalizeDnsRecord(value = {}, index = 0) {
	const type = String(value.type || '').trim().toUpperCase();
	const name = String(value.name || '@').trim().toLowerCase();
	const content = String(value.content || '').trim();
	const ttl = normalizeTtl(value.ttl);
	if (!RECORD_TYPES.has(type)) throw policyError(`PROJECT_DNS_TYPE_INVALID:${index}`);
	if (!HOST.test(name)) throw policyError(`PROJECT_DNS_NAME_INVALID:${index}`);
	if (!content || content.length > 512) throw policyError(`PROJECT_DNS_CONTENT_INVALID:${index}`);
	if (type === 'A' && isIP(content) !== 4) throw policyError(`PROJECT_DNS_A_INVALID:${index}`);
	if (type === 'AAAA' && isIP(content) !== 6) throw policyError(`PROJECT_DNS_AAAA_INVALID:${index}`);
	if (type === 'CNAME' && !hostname(content)) throw policyError(`PROJECT_DNS_CNAME_INVALID:${index}`);
	return { type, name, content, ttl };
}

function normalizeTtl(value) {
	const ttl = Number(value ?? 300);
	if (!Number.isInteger(ttl) || ttl < 60 || ttl > 86400) throw policyError('PROJECT_DNS_TTL_INVALID');
	return ttl;
}

function hostname(value) {
	const text = String(value).replace(/\.$/, '').toLowerCase();
	return text.length <= 253 && HOST.test(text) && text !== '@' && text !== '*';
}

function policyError(code) {
	const error = new Error(code);
	error.code = String(code).split(':')[0];
	error.statusCode = 400;
	return error;
}

module.exports = { normalizeDnsRecord, normalizeDnsRecords };
