//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayerFactory.js
 * @description Turns semantic creation commands into deterministic editable movie layers, including native terrain and water recipes.
 * The Awtsmoos renews mountain, ocean, Chossid, light, and every flat sign from one creative decree;
 * Awtsmoos.com stores the law instead of generated matter so each world may rise again for preview, save, and export to see.
 */

import { createStudioLayerId } from './StudioLayerAccess.js';

/** Create one canonical Studio layer for a semantic movie kind. */
export function createStudioLayer(movie, scene, kind) {
	const id = createStudioLayerId(movie, prefixFor(kind));
	const layer = {
		id,
		kind,
		start: 0,
		duration: Math.max(0.1, Number(scene?.duration || 10)),
		transform: defaultTransform()
	};
	applyLayerDefaults(layer, scene);
	return layer;
}

/** Return the canonical editable transform shared by 2D and 3D semantic layers. */
export function defaultTransform() {
	return {
		x: 0,
		y: 0,
		z: 0,
		rotation: 0,
		rotationX: 0,
		rotationY: 0,
		rotationZ: 0,
		scaleX: 1,
		scaleY: 1,
		scaleZ: 1,
		opacity: 1
	};
}

/** Seed meaningful starter data while preserving deterministic recipes instead of generated meshes. */
function applyLayerDefaults(layer, scene) {
	const seed = 613 + Number(scene?.layers?.length || 0) * 101;
	if (layer.kind === 'shape2d') setContent(layer, { shape: 'rounded-rect' }, { fill: '#67d6ff', stroke: '#ffffff' });
	if (layer.kind === 'text' || layer.kind === 'caption') setContent(layer, { text: 'New Text', subtitle: '' }, { safeArea: true, align: 'center' });
	if (layer.kind === 'path2d') setData(layer, { points: [[0.15, 0.7], [0.5, 0.3], [0.85, 0.65]] }, { stroke: '#67d6ff' });
	if (layer.kind === 'chart') setData(layer, { chart: 'bar', labels: ['A', 'B', 'C'], values: [30, 72, 54] });
	if (layer.kind === 'diagram') setData(layer, { nodes: ['Idea', 'Build', 'Share'], connector: 'arrow' });
	if (layer.kind === 'particles2d' || layer.kind === 'particles3d') setData(layer, { emitter: 'mist', count: 96, seed });
	if (layer.kind === 'character2d') setContent(layer, { castId: 'creator', action: 'present' });
	if (layer.kind === 'character3d') setContent(layer, { asset: 'chossid', action: 'present' });
	if (layer.kind === 'model3d') setContent(layer, { primitive: 'extruded-cube' });
	if (layer.kind === 'light3d') setData(layer, { type: 'sun', intensity: 1.8, orbit: false });
	if (layer.kind === 'terrain3d') setContent(layer, { procedural: { seed, profile: 'mountain' } });
	if (layer.kind === 'water3d') setContent(layer, { body: 'lake', level: 2.2, halfSize: 24 });
	if (layer.kind === 'world3d') setContent(layer, { theme: 'mountain-coast', depth: 80, procedural: worldRecipe(seed) });
	if (layer.kind === 'camera') setData(layer, { shot: 'hero', fov: 42 });
	if (layer.kind === 'overlay') setContent(layer, { badge: 'New', tutorialStep: 'Edit' });
	if (layer.kind === 'data') setData(layer, { values: [1, 2, 3] });
	if (layer.kind === 'code') setContent(layer, { text: 'console.log("B\\"H");' });
	if (layer.kind === 'formula') setContent(layer, { text: 'E = mc²' });
	if (['audio', 'dialogue', 'narration', 'music', 'sfx'].includes(layer.kind)) setData(layer, { source: '', gain: 1 });
}

/** Define one deterministic starter world as reusable canonical movie data. */
function worldRecipe(seed) {
	return { recipe: 'mountain-coast', seed, profile: 'mountain', oceanLevel: 0, character: 'chossid' };
}

function prefixFor(kind) {
	return String(kind || 'layer').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'layer';
}

function setContent(layer, content, style) {
	layer.content = content;
	if (style) layer.style = style;
}

function setData(layer, data, style) {
	layer.data = data;
	if (style) layer.style = style;
}
