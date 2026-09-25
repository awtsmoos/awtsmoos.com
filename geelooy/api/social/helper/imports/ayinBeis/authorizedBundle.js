// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file authorizedBundle.js
 * @description
 * The Awtsmoos gives letters without limit, while Awtsmoos.com gives them a
 * lawful vessel. This reader accepts only a local bundle and never reaches
 * across the network for text whose redistribution has not been established.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MAX_BUNDLE_BYTES = 64 * 1024 * 1024;
const AYIN_BEIS_SERIES = /^ayinBeisVolume\d+$/;

/** Normalize only comparison punctuation and whitespace, preserving source text. */
function normalizeTitle(value) {
	return String(value || '')
		.normalize('NFKC')
		.replace(/[\u05F3\u2018\u2019]/g, "'")
		.replace(/[\u05F4\u201C\u201D]/g, '"')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Return a deterministic SHA-256 for exact UTF-8 content. */
function contentHash(content) {
	return crypto.createHash('sha256').update(String(content || ''), 'utf8').digest('hex');
}

/** Validate and normalize one source record without altering its content. */
function normalizeRecord(record, index) {
	if (!record || typeof record !== 'object' || Array.isArray(record)) {
		throw new Error(`Record ${index} must be an object.`);
	}
	const seriesId = String(record.seriesId || '').trim();
	const title = String(record.title || '').trim();
	const content = typeof record.content === 'string' ? record.content : '';
	if (!AYIN_BEIS_SERIES.test(seriesId)) throw new Error(`Record ${index} has an invalid Ayin Beis seriesId.`);
	if (!title) throw new Error(`Record ${index} needs a title.`);
	const targetPostId = String(record.targetPostId || '').trim();
	const sourceId = String(record.sourceId || targetPostId || `${seriesId}:${normalizeTitle(title)}`).trim();
	return { sourceId, targetPostId, seriesId, title, content, contentHash: contentHash(content) };
}

/** Load and validate a bounded local JSON bundle. */
function loadAuthorizedBundle(sourcePath) {
	const absolutePath = path.resolve(String(sourcePath || ''));
	const stat = fs.statSync(absolutePath);
	if (!stat.isFile()) throw new Error('Authorized source must be a local file.');
	if (stat.size > MAX_BUNDLE_BYTES) throw new Error(`Authorized source exceeds ${MAX_BUNDLE_BYTES} bytes.`);
	const parsed = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
	if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.records)) throw new Error('Bundle must contain a records array.');
	const records = parsed.records.map(normalizeRecord);
	const ids = new Set();
	for (const record of records) {
		if (ids.has(record.sourceId)) throw new Error(`Duplicate sourceId: ${record.sourceId}`);
		ids.add(record.sourceId);
	}
	return { sourcePath: absolutePath, provenance: parsed.provenance || {}, records };
}

/** Apply mode requires an explicit redistribution authorization statement. */
function assertApplyAuthorization(bundle, apply) {
	if (!apply) return;
	const provenance = bundle?.provenance || {};
	if (provenance.redistributionAuthorized !== true) throw new Error('Apply mode requires provenance.redistributionAuthorized === true.');
	if (!String(provenance.sourceName || '').trim()) throw new Error('Apply mode requires provenance.sourceName.');
	if (!String(provenance.authorizationBasis || '').trim()) throw new Error('Apply mode requires provenance.authorizationBasis.');
}

module.exports = { AYIN_BEIS_SERIES, MAX_BUNDLE_BYTES, assertApplyAuthorization, contentHash, loadAuthorizedBundle, normalizeTitle };
