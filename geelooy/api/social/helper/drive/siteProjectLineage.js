//B"H
//Boruch Hashem
//Blessed be He

const { createHash } = require('crypto');
const { verifySiteRemixReceipt } = require('../../../../sites/siteRemixReceipt.js');

const PUBLIC_LINEAGE_PATH = '.well-known/awtsmoos-lineage.json';
const MAX_ANCESTRY = 12;

/**
 * @module SiteProjectLineage
 * @description The Awtsmoos refuses browser-minted lineage and recreates public
 * ancestry only from a server-verified Remix receipt during Cloud bootstrap.
 */
function prepareBootstrapSource(options = {}) {
	const files = cleanClientFiles(options.files || []);
	if (!options.remixReceipt) return files;
	const claim = verifySiteRemixReceipt(options.remixReceipt, options.$i);
	if (!claim) throw lineageError('REMIX_RECEIPT_INVALID');
	const current = currentSite(options);
	const parent = normalizeParent(claim.parent);
	if (!parent || sameSite(parent, current)) throw lineageError('REMIX_RECEIPT_PARENT_INVALID');
	return [...files, verifiedLineageFile(current, parent, claim, options.remixReceipt)];
}

function cleanClientFiles(files) {
	return files.filter(file => {
		const path = String(file?.path || '');
		return path !== PUBLIC_LINEAGE_PATH
			&& !/^\.awtsmoos-remix-origin(?:-\d+)?\.json$/i.test(path);
	});
}

function verifiedLineageFile(current, parent, claim, receipt) {
	const ancestry = uniqueParents([parent, ...(claim.ancestry || [])], current)
		.slice(0, MAX_ANCESTRY);
	const content = JSON.stringify({
		BH: 'B"H',
		kind: 'awtsmoos-verified-lineage-v1',
		verified: true,
		current,
		parent,
		ancestry,
		parentSourceDigest: claim.sourceDigest,
		receiptDigest: receiptDigest(receipt),
		sourceReceipt: receipt
	}, null, '\t');
	return Object.freeze({ path: PUBLIC_LINEAGE_PATH, content, mime: 'application/json' });
}

function currentSite(options) {
	const aliasId = String(options.aliasId || '').trim();
	const siteId = String(options.siteId || options.projectId || '').trim();
	if (!aliasId || !siteId) throw lineageError('REMIX_CHILD_IDENTITY_INVALID');
	return Object.freeze({
		aliasId,
		siteId,
		publicUrl: `/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(siteId)}/`
	});
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

function uniqueParents(values, current) {
	const seen = new Set([current.publicUrl]);
	return values.flatMap(value => {
		const parent = normalizeParent(value);
		if (!parent || seen.has(parent.publicUrl)) return [];
		seen.add(parent.publicUrl);
		return [parent];
	});
}

function sameSite(left, right) {
	return left.aliasId === right.aliasId && left.siteId === right.siteId;
}

function receiptDigest(receipt) {
	return createHash('sha256')
		.update(JSON.stringify(receipt || {}))
		.digest('hex');
}

function lineageError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = { prepareBootstrapSource, PUBLIC_LINEAGE_PATH };
