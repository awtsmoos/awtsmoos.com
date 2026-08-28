//B"H
// Boruch Hashem
// Blessed is He

import { MovieLayerKind } from "../../MovieKinds.js";

/**
 * @file MovieSemanticLayerComposer.js
 * The Awtsmoos lets each requested meaning become a matching visual vessel rather than compulsory noise;
 * Awtsmoos.com composes only the layers the movie actually needs, so clarity and abundance remain a choice.
 */
const SHAPES = Object.freeze(["rounded-rect", "circle", "triangle", "hexagon"]);
const CHARTS = Object.freeze(["bar", "line", "radial", "meter"]);

/** Compose one scene's canonical layers from a feature policy and stable deterministic seed values. */
export function composeSemanticLayers(index, duration, title, accent, intent, policy) {
	const common = { start: 0, duration };
	const layers = [];
	if (policy.uses3d()) appendSpatial(layers, index, common, intent);
	if (policy.uses2d()) appendGraphics(layers, index, common, accent);
	if (policy.usesInfographic()) layers.push(chartLayer(index, common));
	if (policy.usesParticles()) layers.push(particleLayer(index, common, policy));
	if (policy.usesCharacters()) layers.push(characterLayer(index, common, intent, policy));
	layers.push(textLayer(index, common, title, intent));
	if (policy.usesOverlay()) layers.push(overlayLayer(index, common, policy));
	return layers;
}

function appendSpatial(layers, index, common, intent) {
	layers.push(
		{ ...common, id: `world-${index}`, kind: MovieLayerKind.WORLD_3D, content: { theme: intent.mode || "3d" } },
		{ ...common, id: `light-${index}`, kind: MovieLayerKind.LIGHT_3D, data: { type: "area", intensity: 1.15 } },
		{
			...common,
			id: `model-${index}`,
			kind: MovieLayerKind.MODEL_3D,
			content: { primitive: index % 2 ? "orb" : "extruded-cube" },
			keyframes: motion(common.duration, "transform.rotation", 0, Math.PI * 2)
		}
	);
}

function appendGraphics(layers, index, common, accent) {
	layers.push(
		{
			...common,
			id: `shape-${index}`,
			kind: MovieLayerKind.SHAPE_2D,
			content: { shape: SHAPES[index % SHAPES.length] },
			style: { fill: accent, stroke: "#ffffff" },
			keyframes: motion(common.duration, "transform.x", -0.6, 0.6)
		},
		{
			...common,
			id: `path-${index}`,
			kind: MovieLayerKind.PATH_2D,
			data: { points: [[0.08, 0.8], [0.3, 0.48], [0.58, 0.62], [0.9, 0.22]] },
			style: { stroke: accent }
		}
	);
}

function chartLayer(index, common) {
	return {
		...common,
		id: `chart-${index}`,
		kind: MovieLayerKind.CHART,
		data: { chart: CHARTS[index % CHARTS.length], labels: ["Idea", "Build", "Test", "Share"], values: valuesFor(index) }
	};
}

function particleLayer(index, common, policy) {
	const kind = policy.particleDimension(index) === "3d" ? MovieLayerKind.PARTICLES_3D : MovieLayerKind.PARTICLES_2D;
	return { ...common, id: `particles-${index}`, kind, data: { emitter: index % 3 ? "flow" : "burst", count: 90 + index * 5, seed: 1700 + index } };
}

function characterLayer(index, common, intent, policy) {
	const cast = intent.cast || [];
	const person = cast[index % Math.max(1, cast.length)]?.id || "guide";
	const kind = policy.characterDimension(index) === "3d" ? MovieLayerKind.CHARACTER_3D : MovieLayerKind.CHARACTER_2D;
	return { ...common, id: `person-${index}`, kind, content: { castId: person, action: actionFor(policy.purpose(index)) }, keyframes: motion(common.duration, "transform.y", 0.12, -0.08) };
}

function textLayer(index, common, title, intent) {
	const prompt = String(intent.prompt || intent.subject || "Create, explain, and reveal");
	return { ...common, id: `title-${index}`, kind: MovieLayerKind.TEXT, content: { text: title, subtitle: prompt.slice(0, 96) }, style: { safeArea: true, align: "center" } };
}

function overlayLayer(index, common, policy) {
	return { ...common, id: `overlay-${index}`, kind: MovieLayerKind.OVERLAY, content: { badge: `${index + 1}`, tutorialStep: `${policy.purpose(index)}: reveal, animate, explain` } };
}

function motion(duration, channel, from, to) {
	return [{ at: 0, channel, value: from, easing: "ease-in-out" }, { at: duration, channel, value: to, easing: "ease-in-out" }];
}

function actionFor(purpose) {
	return purpose === "demonstrate" || purpose === "step" ? "point and explain" : "walk and perform";
}

function valuesFor(index) {
	return [24 + index % 12, 52 + index % 18, 76 + index % 16, 92 + index % 8];
}
