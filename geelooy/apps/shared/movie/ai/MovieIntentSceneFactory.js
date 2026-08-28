//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentSceneFactory.js
 * @description The Awtsmoos turns one intention into many visible forms;
 * Awtsmoos.com lets tutorials, stories, charts and dimensional worlds share storms.
 */
import { MovieLayerKind } from "../MovieKinds.js";

const CAMERA_KINDS = ["wide", "dolly", "closeup", "overhead", "orbit", "low-angle", "crane"];
const SHAPES = ["rounded-rect", "circle", "triangle", "hexagon"];
const CHARTS = ["bar", "line", "radial", "meter"];

/** Build one duration-aware canonical scene from sparse structured AI intent. */
export function createIntentScene(index, start, duration, intent = {}) {
	const accent = accentFor(index);
	const title = sceneTitle(index, intent);
	const common = { start: 0, duration };
	return {
		id: `intent-scene-${index + 1}`,
		name: title,
		start,
		duration,
		camera: createCamera(index),
		transition: { kind: index ? "crossfade" : "cut", duration: index ? Math.min(0.5, duration / 6) : 0 },
		layers: createLayers(index, duration, title, accent, common, intent)
	};
}

function createLayers(index, duration, title, accent, common, intent) {
	const person = intent.cast?.[index % Math.max(1, intent.cast.length)]?.id || "guide";
	const prompt = String(intent.prompt || intent.subject || "Create, explain, and reveal");
	return [
		{ ...common, id: `world-${index}`, kind: MovieLayerKind.WORLD_3D, content: { theme: intent.mode || "hybrid" } },
		{ ...common, id: `light-${index}`, kind: MovieLayerKind.LIGHT_3D, data: { type: "area", intensity: 1.15 } },
		{ ...common, id: `model-${index}`, kind: MovieLayerKind.MODEL_3D, content: { primitive: index % 2 ? "orb" : "extruded-cube" }, keyframes: motion(duration, "transform.rotation", 0, Math.PI * 2) },
		{ ...common, id: `shape-${index}`, kind: MovieLayerKind.SHAPE_2D, content: { shape: SHAPES[index % SHAPES.length] }, style: { fill: accent, stroke: "#ffffff" }, keyframes: motion(duration, "transform.x", -0.6, 0.6) },
		{ ...common, id: `path-${index}`, kind: MovieLayerKind.PATH_2D, data: { points: [[0.08, 0.8], [0.3, 0.48], [0.58, 0.62], [0.9, 0.22]] }, style: { stroke: accent } },
		{ ...common, id: `chart-${index}`, kind: MovieLayerKind.CHART, data: { chart: CHARTS[index % CHARTS.length], labels: ["Idea", "Build", "Test", "Share"], values: valuesFor(index) } },
		{ ...common, id: `particles-${index}`, kind: index % 2 ? MovieLayerKind.PARTICLES_3D : MovieLayerKind.PARTICLES_2D, data: { emitter: index % 3 ? "flow" : "burst", count: 90 + index * 5, seed: 1700 + index } },
		{ ...common, id: `person-${index}`, kind: index % 3 ? MovieLayerKind.CHARACTER_3D : MovieLayerKind.CHARACTER_2D, content: { castId: person, action: index % 2 ? "point and explain" : "walk and perform" }, keyframes: motion(duration, "transform.y", 0.12, -0.08) },
		{ ...common, id: `title-${index}`, kind: MovieLayerKind.TEXT, content: { text: title, subtitle: prompt.slice(0, 96) }, style: { safeArea: true, align: "center" } },
		{ ...common, id: `overlay-${index}`, kind: MovieLayerKind.OVERLAY, content: { badge: `${index + 1}`, tutorialStep: stepFor(index, intent.mode) } }
	];
}

function createCamera(index) {
	return { kind: CAMERA_KINDS[index % CAMERA_KINDS.length], move: index % 2 ? "push-in" : "arc", position: { x: 0, y: 0, z: 8 } };
}

function motion(duration, channel, from, to) {
	return [{ at: 0, channel, value: from, easing: "ease-in-out" }, { at: duration, channel, value: to, easing: "ease-in-out" }];
}

function sceneTitle(index, intent) {
	const base = String(intent.title || intent.subject || intent.prompt || "AI Movie").trim();
	return `${base || "AI Movie"} — Scene ${index + 1}`;
}

function stepFor(index, mode) {
	return `${mode || "hybrid"} beat ${index + 1}: reveal, animate, explain`;
}

function valuesFor(index) {
	return [24 + index % 12, 52 + index % 18, 76 + index % 16, 92 + index % 8];
}

function accentFor(index) {
	return `hsl(${(188 + index * 37) % 360} 84% 62%)`;
}
