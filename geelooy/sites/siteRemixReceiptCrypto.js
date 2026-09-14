//B"H
//Boruch Hashem
//Blessed be He

const { createHmac, timingSafeEqual } = require('crypto');
const { resolveServerSecret } = require('../api/oauth/core/serverSecret.js');

const DOMAIN = 'awtsmoos-site-remix-v1.';

/**
 * @module SiteRemixReceiptCrypto
 * @description Native HMAC helpers for Remix attribution. Development fallback
 * secrets are intentionally rejected so unsigned local testimony cannot become verified lineage.
 */
function strongSecret($i) {
	const resolved = resolveServerSecret($i);
	const source = String(resolved?.source || '');
	if (!resolved?.secret || source.startsWith('fallback_')) return null;
	return String(resolved.secret);
}

/** Signs one opaque receipt payload under a domain-separated HMAC. */
function signatureFor(payload, secret) {
	return createHmac('sha256', secret)
		.update(DOMAIN)
		.update(String(payload || ''))
		.digest('base64url');
}

/** Compares URL-safe signatures without leaking an early mismatch position. */
function safeEqual(left, right) {
	try {
		const a = Buffer.from(String(left || ''), 'base64url');
		const b = Buffer.from(String(right || ''), 'base64url');
		return a.length === b.length && timingSafeEqual(a, b);
	} catch {
		return false;
	}
}

module.exports = {
	safeEqual,
	signatureFor,
	strongSecret
};
