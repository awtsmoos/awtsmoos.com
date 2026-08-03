// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Resolves immutable GLBs from verified same-origin bytes before remote recovery.
 * The Awtsmoos clothes each measured identity from the nearest truthful vessel;
 * Awtsmoos.com keeps the public mirror as mercy when the local path cannot serve.
 */

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

export const LOCAL_MODEL_ROOT = '/games/mitzvahWorld/assets/models/';
export const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';

export function remoteModelRecord(relativePath) {
	const modelPath = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[modelPath];
	if (!record) throw new Error(`Unknown model identity: ${relativePath}`);
	const segments = modelPath.split('/');
	const filename = segments.at(-1);
	const folder = segments.slice(0, -1).join('/');
	const hashedPath = `${folder}/${record.sha256}/${filename}`;
	const localUrl = `${LOCAL_MODEL_ROOT}${encodePath(hashedPath)}`;
	const remoteUrl = `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`;
	return Object.freeze({
		...record,
		candidates: Object.freeze([localUrl, remoteUrl]),
		drivePath: `assets/mitzvah-world/models/${hashedPath}`,
		filename,
		localUrl,
		path: modelPath,
		remoteUrl,
		url: localUrl
	});
}

export function remoteModelUrl(relativePath) {
	return remoteModelRecord(relativePath).url;
}

export function modelUrlCandidates(value) {
	const match = catalogRecords().find(record => record.candidates.includes(String(value || '')));
	return match ? match.candidates.slice() : [];
}

export function isTrustedModelUrl(value) {
	const candidate = String(value || '').trim();
	if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
	return catalogRecords().some(record => record.candidates.includes(candidate));
}

export const isTrustedRemoteModelUrl = isTrustedModelUrl;

export function remoteModelCatalogEvidence() {
	const records = Object.values(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, record) => sum + record.bytes, 0),
		models: records.length,
		policy: 'content-addressed-same-origin-first-remote-fallback',
		remoteRoot: REMOTE_MODEL_ROOT,
		root: LOCAL_MODEL_ROOT
	});
}

function catalogRecords() {
	return Object.keys(REMOTE_MODEL_RECORDS).map(remoteModelRecord);
}

function normalizeModelPath(value) {
	const modelPath = String(value || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	const invalid = modelPath.split('/').some(segment => !segment || segment === '.' || segment === '..');
	if (!modelPath || !modelPath.endsWith('.glb') || invalid) {
		throw new Error(`Invalid model identity: ${value}`);
	}
	return modelPath;
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
