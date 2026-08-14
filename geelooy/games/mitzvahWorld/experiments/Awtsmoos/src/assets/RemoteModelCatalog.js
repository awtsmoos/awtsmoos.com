// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Resolves immutable GLBs from the local vessel on localhost and the published mirror on remote hosts.
 * The Awtsmoos creates local truth and public revelation without mixing their addresses;
 * Awtsmoos.com keeps every content hash identical while each runtime drinks from the source appointed to its host.
 */

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

export const LOCAL_MODEL_ROOT = '/games/mitzvahWorld/assets/models/';
export const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';

export function remoteModelRecord(relativePath, locationLike = globalThis.location) {
	const modelPath = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[modelPath];
	if (!record) throw new Error(`Unknown model identity: ${relativePath}`);
	const segments = modelPath.split('/');
	const filename = segments.at(-1);
	const folder = segments.slice(0, -1).join('/');
	const hashedPath = `${folder}/${record.sha256}/${filename}`;
	const localUrl = `${LOCAL_MODEL_ROOT}${encodePath(hashedPath)}`;
	const remoteUrl = `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`;
	const source = modelSourceMode(locationLike);
	const candidates = source === 'remote' ? [remoteUrl] : [localUrl, remoteUrl];
	return Object.freeze({
		...record,
		candidates: Object.freeze(candidates),
		drivePath: `assets/mitzvah-world/models/${hashedPath}`,
		filename,
		localUrl,
		path: modelPath,
		remoteUrl,
		source,
		url: source === 'remote' ? remoteUrl : localUrl
	});
}

export function remoteModelUrl(relativePath, locationLike = globalThis.location) {
	return remoteModelRecord(relativePath, locationLike).url;
}

export function modelUrlCandidates(value, locationLike = globalThis.location) {
	const candidate = String(value || '');
	const identity = Object.keys(REMOTE_MODEL_RECORDS).find(path => {
		const record = remoteModelRecord(path, null);
		return record.localUrl === candidate || record.remoteUrl === candidate;
	});
	return identity ? remoteModelRecord(identity, locationLike).candidates.slice() : [];
}

export function modelSourceMode(locationLike = globalThis.location) {
	const hostname = String(locationLike?.hostname || '').toLowerCase();
	if (!hostname) return 'local';
	return isLocalHostname(hostname) ? 'local' : 'remote';
}

export function isTrustedModelUrl(value) {
	const candidate = String(value || '').trim();
	if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
	return catalogRecords().some(record =>
		record.localUrl === candidate || record.remoteUrl === candidate
	);
}

export const isTrustedRemoteModelUrl = isTrustedModelUrl;

export function remoteModelCatalogEvidence() {
	const records = Object.values(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, record) => sum + record.bytes, 0),
		models: records.length,
		policy: 'host-aware-local-authoritative-remote-published',
		remoteRoot: REMOTE_MODEL_ROOT,
		root: LOCAL_MODEL_ROOT
	});
}

function catalogRecords() {
	return Object.keys(REMOTE_MODEL_RECORDS).map(path => remoteModelRecord(path, null));
}

function isLocalHostname(hostname) {
	return hostname === 'localhost'
		|| hostname === '127.0.0.1'
		|| hostname === '0.0.0.0'
		|| hostname === '[::1]'
		|| hostname.endsWith('.localhost');
}

function normalizeModelPath(value) {
	const modelPath = String(value || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	const invalid = modelPath.split('/').some(segment => !segment || segment === '.' || segment === '..');
	if (!modelPath || !modelPath.endsWith('.glb') || invalid) throw new Error(`Invalid model identity: ${value}`);
	return modelPath;
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
