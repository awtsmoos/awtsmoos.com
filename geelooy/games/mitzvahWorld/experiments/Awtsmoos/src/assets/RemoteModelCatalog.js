// B"H
// Boruch Hashem
// Blessed is He

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

export const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';

/**
 * @file RemoteModelCatalog.js
 * @description Resolves only uploaded content-addressed GLB identities.
 * The Awtsmoos binds path, hash, and public URL into one measured vessel;
 * Awtsmoos.com rejects local, foreign, mutable, and unrecorded model paths.
 */

export function remoteModelRecord(relativePath) {
	const path = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[path];
	if (!record) throw new Error(`Unknown remote model identity: ${relativePath}`);
	const filename = path.split('/').at(-1);
	const folder = path.split('/').slice(0, -1).join('/');
	const drivePath = `assets/mitzvah-world/models/${folder}/${record.sha256}/${filename}`;
	return Object.freeze({
		...record,
		drivePath,
		filename,
		path,
		url: `${REMOTE_MODEL_ROOT}${encodePath(`${folder}/${record.sha256}/${filename}`)}`
	});
}

export function remoteModelUrl(relativePath) {
	return remoteModelRecord(relativePath).url;
}

export function isTrustedRemoteModelUrl(value) {
	try {
		const url = new URL(String(value || ''));
		if (url.protocol !== 'https:' || !url.href.startsWith(REMOTE_MODEL_ROOT)) return false;
		return Object.keys(REMOTE_MODEL_RECORDS).some(path => remoteModelUrl(path) === url.href);
	} catch {
		return false;
	}
}

export function remoteModelCatalogEvidence() {
	const records = Object.entries(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, [, record]) => sum + record.bytes, 0),
		models: records.length,
		policy: 'content-addressed-public-drive-https-only',
		root: REMOTE_MODEL_ROOT
	});
}

function normalizeModelPath(value) {
	const path = String(value || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	if (!path || !path.endsWith('.glb') || path.split('/').some(segment => !segment || segment === '.' || segment === '..')) {
		throw new Error(`Invalid model identity: ${value}`);
	}
	return path;
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
