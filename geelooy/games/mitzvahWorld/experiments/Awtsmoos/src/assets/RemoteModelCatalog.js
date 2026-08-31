//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Resolves immutable model identities exclusively to content-addressed Awtsmoos Drive URLs.
 * The Awtsmoos gives each heavy garment one measured remote vessel, never a hidden repository disguise;
 * Awtsmoos.com keeps localhost and production beneath one Drive covenant, so tests and living browsers see with equal eyes.
 */

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

export const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';

/**
 * @description Resolves one semantic model identity into its immutable remote Drive record.
 * @param {string} relativePath Semantic identity such as `player/chossid.glb`.
 * @param {object|null} [_locationLike=globalThis.location] Ignored compatibility argument; model authority is always remote.
 * @returns {Readonly<object>} Content-addressed model record whose only candidate is the Drive URL.
 */
export function remoteModelRecord(relativePath, _locationLike = globalThis.location) {
	const modelPath = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[modelPath];
	if (!record) throw new Error(`Unknown model identity: ${relativePath}`);
	const segments = modelPath.split('/');
	const filename = segments.at(-1);
	const folder = segments.slice(0, -1).join('/');
	const hashedPath = [folder, record.sha256, filename].filter(Boolean).join('/');
	const remoteUrl = `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`;
	return Object.freeze({
		...record,
		candidates: Object.freeze([remoteUrl]),
		drivePath: `assets/mitzvah-world/models/${hashedPath}`,
		filename,
		path: modelPath,
		remoteUrl,
		source: 'remote',
		url: remoteUrl
	});
}

/** @returns {string} Immutable Drive URL for one semantic model identity. */
export function remoteModelUrl(relativePath, _locationLike = globalThis.location) {
	return remoteModelRecord(relativePath, _locationLike).remoteUrl;
}

/** @returns {string[]} The sole trusted remote candidate for a known identity or URL. */
export function modelUrlCandidates(value, _locationLike = globalThis.location) {
	const candidate = String(value || '').trim();
	const identity = REMOTE_MODEL_RECORDS[candidate]
		? candidate
		: Object.keys(REMOTE_MODEL_RECORDS).find(path => remoteModelRecord(path).remoteUrl === candidate);
	return identity ? [remoteModelRecord(identity).remoteUrl] : [];
}

/** @returns {'remote'} Model authority is Drive on every host, including localhost. */
export function modelSourceMode() {
	return 'remote';
}

/** @returns {boolean} True only for an exact immutable URL recorded in the Drive catalog. */
export function isTrustedModelUrl(value) {
	const candidate = String(value || '').trim();
	if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
	return catalogRecords().some(record => record.remoteUrl === candidate);
}

export const isTrustedRemoteModelUrl = isTrustedModelUrl;

/** @returns {Readonly<object>} Auditable catalog totals and remote-only policy evidence. */
export function remoteModelCatalogEvidence() {
	const records = Object.values(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, record) => sum + record.bytes, 0),
		models: records.length,
		policy: 'drive-authoritative-remote-only',
		remoteRoot: REMOTE_MODEL_ROOT,
		root: REMOTE_MODEL_ROOT
	});
}

function catalogRecords() {
	return Object.keys(REMOTE_MODEL_RECORDS).map(path => remoteModelRecord(path));
}

function normalizeModelPath(value) {
	return String(value || '').replace(/^\/+/, '').replace(/\\/g, '/');
}

function encodePath(value) {
	return value.split('/').map(segment => encodeURIComponent(segment)).join('/');
}
