// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Resolves each canonical GLB to one immutable same-origin content-addressed path.
 * The Awtsmoos binds identity, hash, byte count, and place into one honest vessel;
 * Awtsmoos.com serves recovered repository truth locally and in production without a broken distant gate.
 */

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

export const PRODUCTION_MODEL_ORIGIN = 'https://awtsmoos.com';
export const MODEL_ASSET_PATH = '/geelooy/games/mitzvahWorld/assets/models/';
export const REMOTE_MODEL_ROOT = `${modelOrigin()}${MODEL_ASSET_PATH}`;

export function remoteModelRecord(relativePath) {
	const path = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[path];
	if (!record) throw new Error(`Unknown remote model identity: ${relativePath}`);
	const segments = path.split('/');
	const filename = segments.at(-1);
	const folder = segments.slice(0, -1).join('/');
	const relativeAssetPath = `${folder}/${record.sha256}/${filename}`;
	const assetPath = `${MODEL_ASSET_PATH}${encodePath(relativeAssetPath)}`;
	return Object.freeze({
		...record,
		assetPath,
		filename,
		path,
		relativeAssetPath,
		repositoryPath: assetPath.slice(1),
		url: `${modelOrigin()}${assetPath}`
	});
}

export function remoteModelUrl(relativePath) {
	return remoteModelRecord(relativePath).url;
}

export function remoteModelRepositoryPath(relativePath) {
	return remoteModelRecord(relativePath).repositoryPath;
}

export function remoteModelIdentityFromUrl(value) {
	if (!isTrustedRemoteModelUrl(value)) return null;
	const url = new URL(String(value));
	for (const identity of Object.keys(REMOTE_MODEL_RECORDS)) {
		if (remoteModelRecord(identity).assetPath === url.pathname) return identity;
	}
	return null;
}

export function isTrustedRemoteModelUrl(value) {
	try {
		const url = new URL(String(value || ''));
		if (url.search || url.hash || !trustedOrigins().has(url.origin)) return false;
		return Object.keys(REMOTE_MODEL_RECORDS).some(identity => {
			return remoteModelRecord(identity).assetPath === url.pathname;
		});
	} catch {
		return false;
	}
}

export function remoteModelCatalogEvidence() {
	const records = Object.entries(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, [, record]) => sum + record.bytes, 0),
		models: records.length,
		policy: 'content-addressed-same-origin-repository',
		root: MODEL_ASSET_PATH
	});
}

function modelOrigin() {
	const origin = globalThis.location?.origin;
	return /^https?:\/\//.test(origin || '') ? origin : PRODUCTION_MODEL_ORIGIN;
}

function trustedOrigins() {
	return new Set([PRODUCTION_MODEL_ORIGIN, modelOrigin()]);
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
