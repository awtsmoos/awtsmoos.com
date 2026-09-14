//B"H
//Boruch Hashem
//Blessed be He

const { createHash } = require('crypto');
const { safeEqual, signatureFor, strongSecret } = require('./siteRemixReceiptCrypto.js');

const RECEIPT_KIND = 'awtsmoos-site-remix-receipt-v1';
const CLAIM_KIND = 'awtsmoos-site-remix-claim-v1';
const LINEAGE_PATH = '.well-known/awtsmoos-lineage.json';
const MAX_ANCESTRY = 12;

/**
 * @module SiteRemixReceipt
 * @description The Awtsmoos signs exact public source testimony with native HMAC;
 * Awtsmoos.com refuses fallback development secrets for verified attribution.
 */
function createSiteRemixReceipt(manifest, $i) {
	const secret = strongSecret($i);
	if (!secret) return null;
	const claim = claimForManifest(manifest);
	const payload = Buffer.from(JSON.stringify(claim)).toString('base64url');
	return Object.freeze({
		kind: RECEIPT_KIND,
		payload,
		signature: signatureFor(payload, secret)
	});
}

/** Verifies one receipt and returns its normalized signed claim. */
function verifySiteRemixReceipt(receipt, $i) {
	const secret = strongSecret($i);
	if (!secret || receipt?.kind !== RECEIPT_KIND) return null;
	const payload = String(receipt.payload || '');
	const supplied = String(receipt.signature || '');
	const expected = signatureFor(payload, secret);
	if (!safeEqual(supplied, expected)) return null;
	try {
		const claim = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
		return validClaim(claim) ? claim : null;
	} catch {
		return null;
	}
}

function claimForManifest(manifest = {}) {
	const parent = Object.freeze({
		aliasId: String(manifest.aliasId || ''),
		siteId: String(manifest.siteId || ''),
		publicUrl: String(manifest.canonicalUrl || ''),
		sourceKind: String(manifest.sourceKind || 'drive'),
		sourceRevision: manifest.sourceRevision || null
	});
	return Object.freeze({
		kind: CLAIM_KIND,
		parent,
		sourceDigest: digestFiles(manifest.files || []),
		ancestry: inheritedAncestry(manifest.files || [])
	});
}

function digestFiles(files) {
	const hash = createHash('sha256');
	for (const file of [...files].sort((a, b) => String(a.path).localeCompare(String(b.path)))) {
		const path = String(file.path || '');
		const content = String(file.content || '');
		hash.update(`${Buffer.byteLength(path)}:${path}:`);
		hash.update(`${Buffer.byteLength(content)}:`);
		hash.update(content);
		hash.update('\n');
	}
	return hash.digest('hex');
}

function inheritedAncestry(files) {
	const line = files.find(file => String(file?.path || '') === LINEAGE_PATH);
	try {
		const parsed = JSON.parse(String(line?.content || ''));
		return Array.isArray(parsed?.ancestry)
			? parsed.ancestry.slice(0, MAX_ANCESTRY).map(normalizeParent).filter(Boolean)
			: [];
	} catch {
		return [];
	}
}

function normalizeParent(value) {
	if (!value || typeof value !== 'object') return null;
	const aliasId = String(value.aliasId || '').trim();
	const siteId = String(value.siteId || '').trim();
	const publicUrl = String(value.publicUrl || '').trim();
	if (!aliasId || !siteId || !publicUrl.startsWith('/sites/')) return null;
	return Object.freeze({
		aliasId,
		siteId,
		publicUrl,
		sourceKind: String(value.sourceKind || 'drive'),
		sourceRevision: value.sourceRevision || null
	});
}

function validClaim(claim) {
	return claim?.kind === CLAIM_KIND
		&& normalizeParent(claim.parent)
		&& /^[a-f0-9]{64}$/.test(String(claim.sourceDigest || ''))
		&& Array.isArray(claim.ancestry)
		&& claim.ancestry.length <= MAX_ANCESTRY;
}

module.exports = {
	createSiteRemixReceipt,
	verifySiteRemixReceipt
};
