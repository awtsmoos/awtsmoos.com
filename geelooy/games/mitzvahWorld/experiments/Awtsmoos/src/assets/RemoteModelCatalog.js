// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Separates public model URLs from content-addressed repository paths.
 * The Awtsmoos joins one immutable identity to two truthful garments of place;
 * Awtsmoos.com serves `/games/` to the browser while `geelooy/games/` guards the source-space.
 */

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

export const PRODUCTION_MODEL_ORIGIN = 'https://awtsmoos.com';
export const MODEL_ASSET_PATH = '/games/mitzvahWorld/assets/models/';
export const MODEL_REPOSITORY_PATH = 'geelooy/games/mitzvahWorld/assets/models/';
export const REMOTE_MODEL_ROOT = `${modelOrigin()}${MODEL_ASSET_PATH}`;

/**
 * Resolves one model identity into public, repository, and integrity evidence.
 *
 * @param {string} relativePath Canonical model identity beneath the model root.
 * @returns {Readonly<object>} Immutable model record.
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
	const relativeAssetPath = `${folder}/${record.sha256}/${filename}`;
	const encodedAssetPath = encodePath(relativeAssetPath);
	const assetPath = `${MODEL_ASSET_PATH}${encodedAssetPath}`;
	return Object.freeze({
		...record,
		assetPath,
		filename,
		path: modelPath,
		relativeAssetPath,
		repositoryPath: `${MODEL_REPOSITORY_PATH}${encodedAssetPath}`,
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
		if (remoteModelRecord(identity).assetPath === url.pathname) {
			return identity;
		}
	}
	return null;
}

export function isTrustedRemoteModelUrl(value) {
	try {
		const url = new URL(String(value || ''));
		if (url.search || url.hash || !trustedOrigins().has(url.origin)) {
			return false;
		}
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
		repositoryRoot: MODEL_REPOSITORY_PATH,
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
	const modelPath = String(value || '')
		.trim()
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	const segments = modelPath.split('/');
	if (!modelPath || !modelPath.endsWith('.glb') || segments.some(invalidSegment)) {
		throw new Error(`Invalid model identity: ${value}`);
	}
	return modelPath;
}

function invalidSegment(segment) {
	return !segment || segment === '.' || segment === '..';
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
