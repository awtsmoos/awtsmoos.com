//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosThreeMinuteLayerAdapter.js
 * @description The Awtsmoos lets one already-authored entity cross a schema boundary without changing its declared deed;
 * Awtsmoos.com maps explicit enum aliases and time units only, never reading prose to choose a cinematic seed.
 */
import { MovieLayerKind } from '../../../../shared/movie/index.js';

const TWO_DIMENSIONAL = new Set(['2d']);

/** @param {object} entity Explicit showcase entity. @param {string} dimension Explicit scene dimension. @param {number} scale Time-unit multiplier. @param {number} index Entity index. @returns {object} Canonical layer. */
export function yesodShowcaseLayer(entity, dimension, scale, index) {
	const kind = layerKind(entity.kind, dimension);
	const layer = {
		id: entity.id || entity.name || `entity-${index + 1}`,
		kind,
		start: seconds(entity.start, scale),
		duration: seconds(entity.duration, scale),
		transform: normalizeTransform(entity.transform),
		style: normalizeStyle(entity.style),
		content: layerContent(entity, kind),
		data: structuredClone(entity.data || {}),
		keyframes: keyframes(entity.keyframes, scale)
	};
	if (entity.seed != null) layer.data.seed = entity.seed;
	if (entity.style?.count != null) layer.data.count = entity.style.count;
	return layer;
}

function layerKind(kind, dimension) {
	const spatial = !TWO_DIMENSIONAL.has(dimension);
	const aliases = {
		text: MovieLayerKind.TEXT,
		chart: MovieLayerKind.CHART,
		meter: MovieLayerKind.CHART,
		dialogue: MovieLayerKind.DIALOGUE,
		audio: MovieLayerKind.AUDIO,
		image: MovieLayerKind.IMAGE,
		video: MovieLayerKind.VIDEO,
		light: MovieLayerKind.LIGHT_3D,
		path: MovieLayerKind.PATH_2D,
		arrow: MovieLayerKind.OVERLAY,
		callout: MovieLayerKind.OVERLAY
	};
	if (kind === 'character') return spatial ? MovieLayerKind.CHARACTER_3D : MovieLayerKind.CHARACTER_2D;
	if (kind === 'particle') return spatial ? MovieLayerKind.PARTICLES_3D : MovieLayerKind.PARTICLES_2D;
	if (kind === 'shape') return spatial ? MovieLayerKind.MODEL_3D : MovieLayerKind.SHAPE_2D;
	return aliases[kind] || MovieLayerKind.OVERLAY;
}

function layerContent(entity, kind) {
	if (kind === MovieLayerKind.TEXT) return { text: entity.content || entity.name || '' };
	if ([MovieLayerKind.CHARACTER_2D, MovieLayerKind.CHARACTER_3D].includes(kind)) {
		return { cast: entity.name || entity.id, action: entity.data?.action || 'perform' };
	}
	if ([MovieLayerKind.SHAPE_2D, MovieLayerKind.MODEL_3D].includes(kind)) {
		return { shape: entity.style?.shape || 'rounded-rect', primitive: entity.style?.shape || 'orb' };
	}
	if (kind === MovieLayerKind.OVERLAY) return { badge: entity.name || '', tutorialStep: entity.content || '' };
	return typeof entity.content === 'object'
		? structuredClone(entity.content)
		: { text: entity.content || '' };
}

function normalizeStyle(style = {}) {
	return {
		...structuredClone(style),
		fill: style.fill || style.color,
		stroke: style.stroke || style.color
	};
}

function normalizeTransform(transform = {}) {
	const output = structuredClone(transform);
	if (Math.abs(Number(output.x) || 0) > 2) output.x = Number(output.x) / 360;
	if (Math.abs(Number(output.y) || 0) > 2) output.y = Number(output.y) / 240;
	return output;
}

function keyframes(frames = [], scale = 1) {
	const output = [];
	for (const frame of frames) {
		for (const channel of ['x', 'y', 'z', 'rotation', 'scaleX', 'scaleY', 'opacity']) {
			if (frame[channel] == null) continue;
			let value = Number(frame[channel]);
			if (channel === 'x' && Math.abs(value) > 2) value /= 360;
			if (channel === 'y' && Math.abs(value) > 2) value /= 240;
			output.push({ at: seconds(frame.at, scale), channel: `transform.${channel}`, value, easing: frame.easing || 'ease-in-out' });
		}
	}
	return output;
}

function seconds(value, scale) {
	const number = Number(value || 0);
	return Number.isFinite(number) ? number * scale : 0;
}
