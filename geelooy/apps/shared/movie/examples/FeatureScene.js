//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file FeatureScene.js
 * @description One scene factory reveals many forms; the Awtsmoos gives each beat
 * text, shape, person, particle and depth so Awtsmoos.com can test the complete fleet.
 */
import { MovieLayerKind } from "../MovieKinds.js";

/** Build a dense ten-second mixed-media scene from a compact semantic brief. */
export function createFeatureScene(index, brief) {
	const start = index * 10;
	const common = { start: 0, duration: 10 };
	return {
		id: `scene-${String(index + 1).padStart(2, "0")}`,
		name: brief.title,
		start,
		duration: 10,
		camera: { kind: brief.camera, move: brief.move, position: { x: 0, y: brief.cameraY || 0, z: brief.cameraZ || 8 } },
		transition: { kind: brief.transition || (index ? "crossfade" : "cut"), duration: index ? 0.55 : 0 },
		layers: [
			{ ...common, id: `world-${index}`, kind: MovieLayerKind.WORLD_3D, content: { theme: brief.theme, depth: 14 } },
			{ ...common, id: `light-${index}`, kind: MovieLayerKind.LIGHT_3D, data: { type: "area", intensity: 1.2, orbit: true } },
			{ ...common, id: `model-${index}`, kind: MovieLayerKind.MODEL_3D, content: { primitive: brief.model || "extruded-cube" }, keyframes: motion("transform.rotation", 0, 6.28) },
			{ ...common, id: `shape-${index}`, kind: MovieLayerKind.SHAPE_2D, content: { shape: brief.shape || "rounded-rect" }, style: { fill: brief.accent, stroke: "#ffffff" }, keyframes: motion("transform.x", -0.65, 0.6) },
			{ ...common, id: `path-${index}`, kind: MovieLayerKind.PATH_2D, data: { points: [[0.08, 0.78], [0.32, 0.5], [0.58, 0.64], [0.9, 0.2]] }, style: { stroke: brief.accent } },
			{ ...common, id: `chart-${index}`, kind: MovieLayerKind.CHART, data: { chart: brief.chart || "bar", labels: ["Idea", "Build", "Test", "Share"], values: brief.values || [28, 64, 82, 96] } },
			{ ...common, id: `particles-${index}`, kind: index % 2 ? MovieLayerKind.PARTICLES_3D : MovieLayerKind.PARTICLES_2D, data: { emitter: brief.emitter || "burst", count: 90 + index * 8, seed: 700 + index } },
			{ ...common, id: `person-${index}`, kind: index % 3 ? MovieLayerKind.CHARACTER_3D : MovieLayerKind.CHARACTER_2D, content: { castId: brief.person, action: brief.action }, keyframes: motion("transform.y", 0.12, -0.08) },
			{ ...common, id: `title-${index}`, kind: MovieLayerKind.TEXT, content: { text: brief.title, subtitle: brief.subtitle }, style: { safeArea: true, align: "center" } },
			{ ...common, id: `overlay-${index}`, kind: MovieLayerKind.OVERLAY, content: { badge: `${index + 1}/18`, tutorialStep: brief.step } }
		]
	};
}

function motion(channel, from, to) {
	return [
		{ at: 0, channel, value: from, easing: "ease-in-out" },
		{ at: 10, channel, value: to, easing: "ease-in-out" }
	];
}
