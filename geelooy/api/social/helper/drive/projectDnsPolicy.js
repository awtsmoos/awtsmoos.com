//B"H
// Boruch Hashem
// Blessed is He

const { supportedDnsType, validateDnsContent } = require('./projectDnsContentPolicy.js');
const { recordOwnerName } = require('./projectDnsNamePolicy.js');

/**
 * @module DriveProjectDnsPolicy
 * @description
 * The Awtsmoos lets web, mail, service, certificate, and verification intention descend as bounded DNS records;
 * Awtsmoos.com separates owner-name grammar from content grammar so a whole zone can migrate without flattening every record into the same form.
 */

const MAX_RECORDS = 256;
const MAX_CONTENT_LENGTH = 2048;

/**
 * Normalizes one bounded DNS record collection for provider or manual application.
 * @param {Array} values Candidate project DNS records.
 * @returns {Array} Validated portable DNS records.
 */
function normalizeDnsRecords(values = []) {
	if (!Array.isArray(values) || values.length > MAX_RECORDS) {
		throw policyError('PROJECT_DNS_RECORDS_INVALID');
	}
	return values.map((value, index) => normalizeDnsRecord(value, index));
}

/** Normalizes one public DNS record while preserving its type-specific content. */
function normalizeDnsRecord(value = {}, index = 0) {
	const type = String(value.type || '').trim().toUpperCase();
	const name = String(value.name || '@').trim().toLowerCase().replace(/\.$/, '');
	const content = String(value.content || '').trim();
	const ttl = normalizeTtl(value.ttl);
	if (!supportedDnsType(type)) {
		throw policyError(`PROJECT_DNS_TYPE_INVALID:${index}`);
	}
	if (!recordOwnerName(name)) {
		throw policyError(`PROJECT_DNS_NAME_INVALID:${index}`);
	}
	if (!content || Buffer.byteLength(content, 'utf8') > MAX_CONTENT_LENGTH) {
		throw policyError(`PROJECT_DNS_CONTENT_INVALID:${index}`);
	}
	validateDnsContent(type, content, index);
	return { type, name, content, ttl };
}

/** Normalizes TTL into a conservative provider-compatible range. */
function normalizeTtl(value) {
	const ttl = Number(value ?? 300);
	if (!Number.isInteger(ttl) || ttl < 60 || ttl > 86400) {
		throw policyError('PROJECT_DNS_TTL_INVALID');
	}
	return ttl;
}

function policyError(code) {
	const error = new Error(code);
	error.code = String(code).split(':')[0];
	error.statusCode = 400;
	return error;
}

module.exports = { normalizeDnsRecord, normalizeDnsRecords };
