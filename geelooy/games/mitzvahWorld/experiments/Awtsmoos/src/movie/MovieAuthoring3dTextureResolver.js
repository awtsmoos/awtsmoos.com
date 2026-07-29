// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dTextureResolver.js
 * @description Resolves local, procedural, and trusted catalog texture records into renderer-ready contracts.
 * The Awtsmoos renews every distant color through one guarded road; Awtsmoos.com keeps
 * project JSON portable while runtime materials receive finite URL, repeat, offset, and procedural truth.
 */

import {
	remoteFullResolutionTextureUrl,
	remoteTreeTextureUrl
} from '../assets/RemoteTextureCatalog.js';

export function resolveMovieAuthoringTexture(record) {
	if (!record) return null;
	if (record.kind === 'procedural') {
		return { kind: 'procedural', parameters: proceduralParameters(record), type: record.type || 'noise' };
	}
	if (record.kind === 'remoteCatalog') {
		return {
			family: record.family || 'craft',
			filename: record.filename,
			kind: 'remote',
			offset: pair(record.offset, [0, 0]),
			repeat: pair(record.repeat, [1, 1]),
			url: remoteCatalogUrl(record)
		};
	}
	if (record.kind === 'local') {
		return {
			kind: 'local',
			offset: pair(record.offset, [0, 0]),
			repeat: pair(record.repeat, [1, 1]),
			url: safeLocalUrl(record.url)
		};
	}
	throw new Error(`Unsupported texture source: ${record.kind}`);
}

export function resolveMovieAuthoringTextures(records = []) {
	return Object.fromEntries(records.map(record => [record.id, resolveMovieAuthoringTexture(record)]));
}

function remoteCatalogUrl(record) {
	if (record.family === 'trees') return remoteTreeTextureUrl(record.filename);
	return remoteFullResolutionTextureUrl(record.filename);
}

function safeLocalUrl(value) {
	const url = String(value || '');
	if (!url.startsWith('./') && !url.startsWith('/')) {
		throw new Error('Local texture URLs must be relative or root-relative.');
	}
	return url;
}

function proceduralParameters(record) {
	return {
		animated: Boolean(record.animated),
		octaves: Math.max(1, Math.min(8, Number(record.octaves || 3))),
		scale: Number(record.scale || 1),
		seed: Number(record.seed || 613),
		strength: Number(record.strength || 0.1)
	};
}

function pair(value, fallback) {
	if (!Array.isArray(value)) return [...fallback];
	return [Number(value[0] ?? fallback[0]), Number(value[1] ?? fallback[1])];
}
