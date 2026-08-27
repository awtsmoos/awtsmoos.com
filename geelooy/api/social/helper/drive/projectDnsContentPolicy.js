//B"H
// Boruch Hashem
// Blessed is He

const { isIP } = require('net');
const { hostname } = require('./projectDnsNamePolicy.js');

/**
 * @module DriveProjectDnsContentPolicy
 * @description
 * The Awtsmoos lets mail, service, certificate, address, and verification records keep their distinct forms;
 * Awtsmoos.com measures each DNS content vessel before provider or manual application, so migration can be generous without becoming formless.
 */

const RECORD_TYPES = new Set(['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'CAA', 'SRV', 'NS']);
const MAX_TEXT_LENGTH = 2048;
const MAX_VALUE_LENGTH = 1024;
const CAA_TAG = /^(?:issue|issuewild|iodef)$/i;

/** Returns whether a DNS type is supported by the portable project covenant. */
function supportedDnsType(type) {
	return RECORD_TYPES.has(type);
}

/** Validates one DNS content string according to record type semantics. */
function validateDnsContent(type, content, index) {
	if (type === 'A' && isIP(content) !== 4) {
		throw contentError(`PROJECT_DNS_A_INVALID:${index}`);
	}
	if (type === 'AAAA' && isIP(content) !== 6) {
		throw contentError(`PROJECT_DNS_AAAA_INVALID:${index}`);
	}
	if ((type === 'CNAME' || type === 'NS') && !dnsTarget(content)) {
		throw contentError(`PROJECT_DNS_${type}_INVALID:${index}`);
	}
	if (type === 'MX') {
		validateMx(content, index);
	}
	if (type === 'SRV') {
		validateSrv(content, index);
	}
	if (type === 'CAA') {
		validateCaa(content, index);
	}
	if (type === 'TXT' && Buffer.byteLength(content, 'utf8') > MAX_TEXT_LENGTH) {
		throw contentError(`PROJECT_DNS_TXT_INVALID:${index}`);
	}
}

/** Validates `priority hostname` mail-exchanger content. */
function validateMx(content, index) {
	const [priority, target, ...extra] = fields(content);
	if (!integerBetween(priority, 0, 65535) || !dnsTarget(target) || extra.length) {
		throw contentError(`PROJECT_DNS_MX_INVALID:${index}`);
	}
}

/** Validates `priority weight port hostname` service content. */
function validateSrv(content, index) {
	const [priority, weight, port, target, ...extra] = fields(content);
	const numbersValid = integerBetween(priority, 0, 65535)
		&& integerBetween(weight, 0, 65535)
		&& integerBetween(port, 0, 65535);
	if (!numbersValid || !dnsTarget(target, true) || extra.length) {
		throw contentError(`PROJECT_DNS_SRV_INVALID:${index}`);
	}
}

/** Validates `flags tag value` certificate-authority authorization content. */
function validateCaa(content, index) {
	const [flags, tag, ...valueParts] = fields(content);
	const value = valueParts.join(' ');
	if (!integerBetween(flags, 0, 255) || !CAA_TAG.test(tag || '') || !value || value.length > MAX_VALUE_LENGTH) {
		throw contentError(`PROJECT_DNS_CAA_INVALID:${index}`);
	}
}

/** Accepts a hostname target and optionally the SRV root-dot sentinel. */
function dnsTarget(value, allowRoot = false) {
	const text = String(value || '').trim();
	return (allowRoot && text === '.') || hostname(text);
}

function fields(value) {
	return String(value || '').trim().split(/\s+/).filter(Boolean);
}

function integerBetween(value, minimum, maximum) {
	if (!/^\d+$/.test(String(value || ''))) {
		return false;
	}
	const number = Number(value);
	return Number.isInteger(number) && number >= minimum && number <= maximum;
}

function contentError(code) {
	const error = new Error(code);
	error.code = String(code).split(':')[0];
	error.statusCode = 400;
	return error;
}

module.exports = { supportedDnsType, validateDnsContent };
