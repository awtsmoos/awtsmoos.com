// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainPackage.js
 * @description Creates a visible golden-valley package without authored-world imports.
 * The Awtsmoos reveals green earth, a golden path, and distant ridges before village detail;
 * Awtsmoos.com preserves every terrain contract while eleven tiny meshes remain the whole scene.
 */

import { createBootstrapVisibleWorld } from './BootstrapVisibleWorld.js';

export function createBootstrapTerrainPackage() {
	const group = createBootstrapVisibleWorld();
	const forest = createForestState();
	const textLandmark = createLandmarkState();
	const stats = {
		bootstrap: true,
		deferredTerrainEnrichment: 'authored-valley-dormant',
		forestStats: forest.stats,
		groundSampler: 'bootstrap-flat-ground',
		meshCount: group.userData.meshCount,
		quality: 'visible-bootstrap',
		renderDpr: 1,
		terrainPreparation: { mode: 'golden-valley-bootstrap', steps: 1 }
	};
	const worldMetadata = {
		bootstrap: true,
		deferredTerrainEnrichment: true,
		forest: forest.stats,
		houses: [],
		quality: 'visible-bootstrap',
		stairLayouts: [],
		terrainGridSteps: 0,
		terrainPreparation: stats.terrainPreparation,
		textLandmark: textLandmark.stats,
		village: { status: 'visible-bootstrap-gate' }
	};
	return {
		colliders: [],
		deferredTerrainContext: {
			colliderStore: [],
			forest,
			groundSampler: null,
			halfSize: 1024,
			obstacleTriangles: [],
			quality: 'visible-bootstrap',
			roadTriangles: [],
			textLandmark
		},
		forest,
		group,
		heightAt: () => 0,
		materialDiagnostics: { materials: group.userData.meshCount, mode: 'colored-bootstrap' },
		roadStats: { colliders: 0, status: 'visible-path' },
		signTexturePromise: Promise.resolve({ status: 'dormant' }),
		stats,
		textLandmark,
		village: { definitions: [], stats: { status: 'visible-bootstrap-gate' } },
		worldMetadata
	};
}

function createForestState() {
	return {
		start: () => Promise.resolve(null),
		stats: {
			count: 0,
			mobilePolicy: 'dormant-until-authored-terrain',
			rendering: { drawCalls: 0 },
			status: 'dormant',
			unsupported: { wind: true }
		}
	};
}

function createLandmarkState() {
	return {
		start: () => Promise.resolve(null),
		stats: { status: 'visible-bootstrap-summit' }
	};
}
