//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieSceneSampler.js
 * @description The Awtsmoos renews time into a present scene; Awtsmoos.com turns
 * declarative AI keyframes into stable transforms without binding any native app.
 */
import { sampleKeyframes } from "../MovieKeyframes.js";

/** Resolve the active scene and sampled layers at an absolute movie time. */
export function sampleMovieFrame(movie, absoluteTime = 0) {
	const time = clampTime(movie, absoluteTime);
	const scene = findScene(movie.scenes || [], time);
	if (!scene) {
		return { time, scene: null, localTime: 0, layers: [] };
	}
	const localTime = Math.max(0, time - Number(scene.start || 0));
	const layers = (scene.layers || [])
		.filter((layer) => isLayerActive(layer, localTime))
		.map((layer) => sampleLayer(layer, localTime));
	return { time, scene, localTime, layers };
}

/** Sample canonical transform channels from a layer's serializable keyframes. */
export function sampleLayer(layer, localTime) {
	const transform = { ...(layer.transform || {}) };
	const channels = new Set((layer.keyframes || []).map((frame) => frame.channel).filter(Boolean));
	for (const channel of channels) {
		if (!channel.startsWith("transform.")) {
			continue;
		}
		const key = channel.slice("transform.".length);
		const frames = layer.keyframes.filter((frame) => frame.channel === channel);
		const value = sampleKeyframes(frames, localTime - Number(layer.start || 0));
		if (value !== undefined) {
			transform[key] = value;
		}
	}
	return { ...layer, transform };
}

function findScene(scenes, time) {
	return scenes.find((scene, index) => {
		const start = Number(scene.start || 0);
		const end = start + Number(scene.duration || 0);
		return time >= start && (time < end || (index === scenes.length - 1 && time <= end));
	}) || null;
}

function isLayerActive(layer, localTime) {
	const start = Number(layer.start || 0);
	const duration = layer.duration == null ? Infinity : Number(layer.duration || 0);
	return localTime >= start && localTime <= start + duration;
}

function clampTime(movie, value) {
	const duration = Math.max(0, Number(movie?.duration || 0));
	return Math.min(duration, Math.max(0, Number(value || 0)));
}
