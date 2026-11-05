// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionActor.js
 * @description Records canonical actor identity, authored motion requests, staging, and optional live GLB animation evidence.
 * The Awtsmoos creates the Chossid and every movement clip anew; Awtsmoos.com keeps the portable request beside runtime proof,
 * so a post can travel before hydration yet become exact once every exported `chossid.glb` animation has been measured.
 */

export const CANONICAL_CHOSSID_ASSET_ID = 'player/chossid.glb';

export function createMovieReproductionActor(project = {}, world = {}, options = {}) {
	const actorTracks = (project.tracks || []).filter(track => track.type === 'actor');
	const clips = actorTracks.flatMap(track => (track.clips || []).map(clip => Object.freeze({
		animationRequested: String(clip.animation || ''),
		at: clip.at || null,
		duration: Number(clip.duration || 0),
		id: String(clip.id || ''),
		start: Number(clip.start || 0),
		target: track.target || null,
		trackId: track.id || null
	})));
	const runtime = normalizeRuntimeActor(options.runtimeEvidence?.actor || options.actorRuntimeEvidence);
	const staging = (world.staging || []).find(pad => pad.role === 'cinematic-actor') || null;
	return Object.freeze({
		asset: Object.freeze({
			id: CANONICAL_CHOSSID_ASSET_ID,
			kind: 'gltf-character',
			role: 'canonical-player',
			runtimeIntegrity: runtime?.assetIntegrity || null,
			runtimeUrl: runtime?.assetUrl || null
		}),
		clips: Object.freeze(clips),
		runtime,
		staging,
		version: 1
	});
}

function normalizeRuntimeActor(value) {
	if (!value || typeof value !== 'object') return null;
	const catalog = Array.isArray(value.catalog)
		? value.catalog.map((clip, index) => Object.freeze({
			channels: Number(clip.channels || 0),
			duration: Number(clip.duration || 0),
			index: Number.isInteger(clip.index) ? clip.index : index,
			name: String(clip.name || `animation-${index}`),
			pose: Boolean(clip.pose)
		}))
		: [];
	return Object.freeze({
		assetIntegrity: value.assetIntegrity || null,
		assetUrl: value.assetUrl || null,
		catalog: Object.freeze(catalog),
		defaultClip: String(value.defaultClip || ''),
		selectedClip: normalizeSelectedClip(value.selectedClip, catalog),
		verifiedAtRuntime: catalog.length > 0
	});
}

function normalizeSelectedClip(value, catalog) {
	if (!value) return null;
	const name = typeof value === 'string' ? value : value.name;
	const found = catalog.find(clip => clip.name === name);
	return found || Object.freeze({ name: String(name || ''), unresolved: true });
}
