// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiAuthoring3d.js
 * @description Exposes immutable discovery, snapshots, and revisioned replacement for custom 3D authoring.
 * The Awtsmoos renews every sculpted point and moving limb beyond public mutation; Awtsmoos.com
 * gives agents one stable door while all authored change returns through canonical project installation.
 */

import { normalizeMovieAuthoring3d, validateMovieAuthoring3d } from './MovieAuthoring3dContract.js';
import { movieModifierCatalog } from './MovieModifierCatalog.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioAuthoring3dDomain(session) {
	return Object.freeze({
		catalog: () => createMovieProjectSnapshot({
			defaultModelUrl: './assets/models/player/chossid.glb',
			geometryNodeTypes: geometryNodeTypes(),
			modifierTypes: movieModifierCatalog(),
			motionModes: ['action', 'keyframes', 'manualControls'],
			sculptBrushes: sculptBrushes(),
			shaderNodeTypes: shaderNodeTypes(),
			textureSources: ['local', 'remoteCatalog', 'procedural']
		}),
		replace: (source, options = {}) => runMovieStudioApiOperation(
			session,
			'authoring3d.replace',
			options,
			() => replaceAuthoring(session, source, options)
		),
		snapshot: () => createMovieProjectSnapshot(session.project.authoring3d),
		toJSON: () => createMovieProjectSnapshot(session.project.authoring3d),
		validate: source => createMovieProjectSnapshot(
			validateMovieAuthoring3d(normalizeMovieAuthoring3d(source))
		)
	});
}

function replaceAuthoring(session, source, options) {
	const authoring3d = validateMovieAuthoring3d(normalizeMovieAuthoring3d(source));
	return session.installProject({
		...session.project,
		authoring3d
	}, {
		preserveTime: true,
		preserveTimeline: true,
		reason: options.label || 'Replace 3D authoring document'
	});
}

function geometryNodeTypes() {
	return ['input', 'primitive', 'transform', 'instance', 'distribute', 'join', 'boolean', 'extrude', 'subdivide', 'setMaterial', 'output'];
}

function shaderNodeTypes() {
	return ['value', 'color', 'texture', 'noise', 'grain', 'normal', 'bump', 'mapping', 'mix', 'principled', 'emission', 'transparent', 'output'];
}

function sculptBrushes() {
	return ['draw', 'drawSharp', 'clay', 'clayStrips', 'inflate', 'blob', 'crease', 'smooth', 'flatten', 'fill', 'scrape', 'grab', 'snakeHook', 'thumb', 'pose', 'mask'];
}
