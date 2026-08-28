//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentEntityAdapter.js
 * @description The Awtsmoos lets human semantic entities enter one canonical layer tongue;
 * Awtsmoos.com keeps AI expressive above the renderer while every visible vessel stays young.
 */
import { MovieLayerKind } from "../MovieKinds.js";

/** Convert one semantic AI entity into a canonical renderer layer. */
export function adaptIntentEntity(entity = {}, scene = {}, scale = 1, index = 0) {
	const kind = layerKind(entity.kind, scene.dimension);
	const duration = seconds(entity.duration ?? scene.duration, scale);
	const layer = {
		id: entity.id || entity.name || `entity-${index}`,
		kind,
		start: seconds(entity.start, scale),
		duration,
		transform: normalizeTransform(entity.transform),
		style: normalizeStyle(entity.style),
		content: contentFor(entity, kind),
		data: structuredClone(entity.data || {}),
		keyframes: adaptKeyframes(entity.keyframes, scale)
	};
	if (entity.seed != null) layer.data.seed = entity.seed;
	if (entity.style?.count != null) layer.data.count = entity.style.count;
	return layer;
}

function layerKind(kind, dimension) {
	const three = dimension === "3d" || dimension === "hybrid";
	if (kind === "character") return three ? MovieLayerKind.CHARACTER_3D : MovieLayerKind.CHARACTER_2D;
	if (kind === "particle") return three ? MovieLayerKind.PARTICLES_3D : MovieLayerKind.PARTICLES_2D;
	if (kind === "shape") return three ? MovieLayerKind.MODEL_3D : MovieLayerKind.SHAPE_2D;
	if (kind === "text") return MovieLayerKind.TEXT;
	if (kind === "chart" || kind === "meter") return MovieLayerKind.CHART;
	if (kind === "dialogue") return MovieLayerKind.DIALOGUE;
	if (kind === "audio") return MovieLayerKind.AUDIO;
	if (kind === "image") return MovieLayerKind.IMAGE;
	if (kind === "video") return MovieLayerKind.VIDEO;
	if (kind === "light") return MovieLayerKind.LIGHT_3D;
	if (kind === "path") return MovieLayerKind.PATH_2D;
	if (kind === "arrow" || kind === "callout") return MovieLayerKind.OVERLAY;
	return MovieLayerKind.OVERLAY;
}

function contentFor(entity, kind) {
	if (kind === MovieLayerKind.TEXT) {
		return { text: entity.content || entity.name || "", subtitle: entity.data?.subtitle || "" };
	}
	if ([MovieLayerKind.CHARACTER_2D, MovieLayerKind.CHARACTER_3D].includes(kind)) {
		return { cast: entity.name || entity.data?.castId || entity.id, action: entity.data?.action || "perform" };
	}
	if ([MovieLayerKind.SHAPE_2D, MovieLayerKind.MODEL_3D].includes(kind)) {
		return { shape: entity.style?.shape || "rounded-rect", primitive: entity.style?.shape || "orb" };
	}
	if (kind === MovieLayerKind.OVERLAY) {
		return { badge: entity.name || "", tutorialStep: entity.content || entity.data?.label || "" };
	}
	return entity.content && typeof entity.content === "object"
		? structuredClone(entity.content)
		: { text: entity.content || "" };
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

function adaptKeyframes(keyframes = [], scale = 1) {
	const output = [];
	for (const frame of keyframes || []) {
		for (const key of ["x", "y", "z", "rotation", "scaleX", "scaleY", "opacity"]) {
			if (frame[key] == null) continue;
			let value = Number(frame[key]);
			if (key === "x" && Math.abs(value) > 2) value /= 360;
			if (key === "y" && Math.abs(value) > 2) value /= 240;
			output.push({ at: seconds(frame.at, scale), channel: `transform.${key}`, value, easing: frame.easing || "ease-in-out" });
		}
	}
	return output;
}

function seconds(value, scale) {
	const number = Number(value || 0);
	return Number.isFinite(number) ? number * scale : 0;
}
