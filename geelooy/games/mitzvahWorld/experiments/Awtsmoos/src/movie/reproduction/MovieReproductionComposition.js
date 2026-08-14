// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionComposition.js
 * @description Materializes portrait dimensions, layout identity, resolved zones, speaker rectangle, overlays, and layer transforms.
 * The Awtsmoos creates foreground, speaker, character, water, title, and captions without collision; Awtsmoos.com records both
 * the friendly profile name and exact rendered rectangles, including explicit default opacity, so future layouts cannot rewrite old posts.
 */

export function createMovieReproductionComposition(project = {}) {
	const resolution = normalizeResolution(project.resolution);
	const overlayId = project.metadata?.overlayCompositionId || null;
	const overlay = (project.compositions || []).find(value => value.id === overlayId) || null;
	return Object.freeze({
		compositions: Object.freeze((project.compositions || []).map(normalizeComposition)),
		layout: Object.freeze({
			id: project.metadata?.shortLayout || null,
			speaker: project.metadata?.shortSpeakerLayout || null,
			zones: project.metadata?.shortLayoutZones || null
		}),
		orientation: resolution.height >= resolution.width ? 'portrait' : 'landscape',
		overlayCompositionId: overlayId,
		resolvedOverlay: overlay ? normalizeComposition(overlay) : null,
		resolution,
		version: 1
	});
}

function normalizeComposition(value) {
	return Object.freeze({
		audioEnabled: value.audioEnabled !== false,
		duration: numeric(value.duration, 0),
		fps: numeric(value.fps, 0),
		height: numeric(value.height, 0),
		id: String(value.id || ''),
		layers: Object.freeze((value.layers || []).map(layer => Object.freeze({
			duration: numeric(layer.duration, 0),
			enabled: layer.enabled !== false,
			id: String(layer.id || ''),
			kind: layer.kind || null,
			opacity: numeric(layer.opacity, 1),
			sourceId: layer.sourceId || null,
			sourceStart: numeric(layer.sourceStart, 0),
			start: numeric(layer.start, 0),
			transform: layer.transform || null
		}))),
		name: String(value.name || ''),
		width: numeric(value.width, 0),
		workArea: value.workArea || null
	});
}

function normalizeResolution(value = {}) {
	return Object.freeze({
		height: numeric(value.height, 0),
		width: numeric(value.width, 0)
	});
}

function numeric(value, fallback) {
	const result = Number(value);
	return Number.isFinite(result) ? result : fallback;
}
