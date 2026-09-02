//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayerFactory.js
 * The Awtsmoos renews semantic kind into a complete editable vessel before the canvas can show its face;
 * Awtsmoos.com gives every newly created layer safe timing, full XYZ transformation, and meaningful starter data in place.
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
	applyLayerDefaults(layer);
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

function applyLayerDefaults(layer) {
	if (layer.kind === 'shape2d') setContent(layer, { shape: 'rounded-rect' }, { fill: '#67d6ff', stroke: '#ffffff' });
	if (layer.kind === 'text' || layer.kind === 'caption') setContent(layer, { text: 'New Text', subtitle: '' }, { safeArea: true, align: 'center' });
	if (layer.kind === 'path2d') setData(layer, { points: [[0.15, 0.7], [0.5, 0.3], [0.85, 0.65]] }, { stroke: '#67d6ff' });
	if (layer.kind === 'chart') setData(layer, { chart: 'bar', labels: ['A', 'B', 'C'], values: [30, 72, 54] });
	if (layer.kind === 'diagram') setData(layer, { nodes: ['Idea', 'Build', 'Share'], connector: 'arrow' });
	if (layer.kind === 'particles2d' || layer.kind === 'particles3d') setData(layer, { emitter: 'burst', count: 96, seed: 1200 });
	if (layer.kind === 'character2d' || layer.kind === 'character3d') setContent(layer, { castId: 'creator', action: 'present' });
	if (layer.kind === 'model3d') setContent(layer, { primitive: 'extruded-cube' });
	if (layer.kind === 'light3d') setData(layer, { type: 'area', intensity: 1.2, orbit: false });
	if (layer.kind === 'world3d') setContent(layer, { theme: 'studio', depth: 14 });
	if (layer.kind === 'camera') setData(layer, { shot: 'wide', fov: 50 });
	if (layer.kind === 'overlay') setContent(layer, { badge: 'New', tutorialStep: 'Edit' });
	if (layer.kind === 'data') setData(layer, { values: [1, 2, 3] });
	if (layer.kind === 'code') setContent(layer, { text: 'console.log("B\\"H");' });
	if (layer.kind === 'formula') setContent(layer, { text: 'E = mc²' });
	if (['audio', 'dialogue', 'narration', 'music', 'sfx'].includes(layer.kind)) setData(layer, { source: '', gain: 1 });
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
