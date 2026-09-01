//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTemplateLayers.js
 * The Awtsmoos renews flat sign and spatial world within one cinematic breath;
 * Awtsmoos.com lets starter projects reveal real renderer features instead of decorative depth.
 */
import { MovieLayerKind } from '../../../shared/movie/MovieKinds.js';

/** Build semantic layers for one ten-second template scene. */
export function createTemplateLayers(sceneIndex, brief) {
	const common = { start: 0, duration: 10 };
	const layers = [];
	if (brief.world) layers.push(worldLayer(sceneIndex, brief, common));
	if (brief.light) layers.push(lightLayer(sceneIndex, common));
	if (brief.model) layers.push(modelLayer(sceneIndex, brief, common));
	if (brief.character) layers.push(characterLayer(sceneIndex, brief, common));
	if (brief.shape) layers.push(shapeLayer(sceneIndex, brief, common));
	if (brief.path) layers.push(pathLayer(sceneIndex, brief, common));
	if (brief.chart) layers.push(chartLayer(sceneIndex, brief, common));
	if (brief.diagram) layers.push(diagramLayer(sceneIndex, brief, common));
	if (brief.particles) layers.push(particleLayer(sceneIndex, brief, common));
	layers.push(textLayer(sceneIndex, brief, common));
	return layers;
}

function worldLayer(index, brief, common) {
	return { ...common, id: `world-${index}`, kind: MovieLayerKind.WORLD_3D, content: { theme: brief.world, depth: 14 } };
}

function lightLayer(index, common) {
	return { ...common, id: `light-${index}`, kind: MovieLayerKind.LIGHT_3D, data: { type: 'area', intensity: 1.25, orbit: true } };
}

function modelLayer(index, brief, common) {
	return { ...common, id: `model-${index}`, kind: MovieLayerKind.MODEL_3D, content: { primitive: brief.model }, keyframes: motion('transform.rotation', 0, 6.28) };
}

function characterLayer(index, brief, common) {
	return { ...common, id: `character-${index}`, kind: brief.character3d ? MovieLayerKind.CHARACTER_3D : MovieLayerKind.CHARACTER_2D, content: { castId: brief.character, action: brief.action || 'present' }, keyframes: motion('transform.x', -0.2, 0.2) };
}

function shapeLayer(index, brief, common) {
	return { ...common, id: `shape-${index}`, kind: MovieLayerKind.SHAPE_2D, content: { shape: brief.shape }, style: { fill: brief.accent, stroke: '#ffffff' }, keyframes: motion('transform.scaleX', 0.72, 1.08) };
}

function pathLayer(index, brief, common) {
	return { ...common, id: `path-${index}`, kind: MovieLayerKind.PATH_2D, data: { points: [[0.1, 0.75], [0.34, 0.48], [0.62, 0.6], [0.9, 0.22]] }, style: { stroke: brief.accent } };
}

function chartLayer(index, brief, common) {
	return { ...common, id: `chart-${index}`, kind: MovieLayerKind.CHART, data: { chart: brief.chart, labels: brief.labels || ['Start', 'Build', 'Test', 'Share'], values: brief.values || [22, 58, 81, 96] } };
}

function diagramLayer(index, brief, common) {
	return { ...common, id: `diagram-${index}`, kind: MovieLayerKind.DIAGRAM, data: { nodes: brief.diagram, connector: 'arrow' } };
}

function particleLayer(index, brief, common) {
	return { ...common, id: `particles-${index}`, kind: brief.particles3d ? MovieLayerKind.PARTICLES_3D : MovieLayerKind.PARTICLES_2D, data: { emitter: brief.particles, count: 96, seed: 1200 + index } };
}

function textLayer(index, brief, common) {
	return { ...common, id: `text-${index}`, kind: MovieLayerKind.TEXT, content: { text: brief.title, subtitle: brief.subtitle || '' }, style: { safeArea: true, align: 'center' } };
}

function motion(channel, from, to) {
	return [{ at: 0, channel, value: from, easing: 'ease-in-out' }, { at: 10, channel, value: to, easing: 'ease-in-out' }];
}
