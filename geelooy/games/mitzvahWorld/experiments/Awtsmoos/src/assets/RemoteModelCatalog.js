// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Resolves only uploaded content-addressed GLB identities.
 * The Awtsmoos binds path, hash, and public URL into one measured vessel;
 * Awtsmoos.com rejects local, foreign, mutable, and unrecorded model paths.
 */

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

export const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';

/**
 * Resolves one semantic model identity into its immutable Drive record.
 *
 * @param {string} relativePath Model path beneath the semantic model root.
 * @returns {Readonly<object>} Frozen identity, integrity, and public URL evidence.
 */
export function remoteModelRecord(relativePath) {
	const modelPath = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[modelPath];
	if (!record) {
		throw new Error(`Unknown remote model identity: ${relativePath}`);
	}
	const segments = modelPath.split('/');
	const filename = segments.at(-1);
	const folder = segments.slice(0, -1).join('/');
	const hashedPath = `${folder}/${record.sha256}/${filename}`;
	return Object.freeze({
		...record,
		drivePath: `assets/mitzvah-world/models/${hashedPath}`,
		filename,
		path: modelPath,
		url: `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`
	});
}

export function remoteModelUrl(relativePath) {
	return remoteModelRecord(relativePath).url;
}

export function isTrustedRemoteModelUrl(value) {
	try {
		const url = new URL(String(value || ''));
		if (url.protocol !== 'https:' || !url.href.startsWith(REMOTE_MODEL_ROOT)) {
			return false;
		}
		return Object.keys(REMOTE_MODEL_RECORDS).some(modelPath => {
			return remoteModelUrl(modelPath) === url.href;
		});
	} catch {
		return false;
	}
}

export function remoteModelCatalogEvidence() {
	const records = Object.values(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, record) => sum + record.bytes, 0),
		models: records.length,
		policy: 'content-addressed-public-drive-https-only',
		root: REMOTE_MODEL_ROOT
	});
}

function normalizeModelPath(value) {
	const modelPath = String(value || '')
		.trim()
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	const invalid = modelPath.split('/').some(segment => {
		return !segment || segment === '.' || segment === '..';
	});
	if (!modelPath || !modelPath.endsWith('.glb') || invalid) {
		throw new Error(`Invalid model identity: ${value}`);
	}
	return modelPath;
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
