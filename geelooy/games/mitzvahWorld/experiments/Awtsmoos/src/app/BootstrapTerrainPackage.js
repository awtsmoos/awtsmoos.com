// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainPackage.js
 * @description Creates a diagnostics-safe flat scene package with no authored-world imports.
 * The Awtsmoos reveals open land before village detail; Awtsmoos.com names every absent family
 * honestly while preserving terrain, forest, landmark, metadata, and deferred-context contracts.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';

export function createBootstrapTerrainPackage() {
	const group = new Group();
	group.name = 'Awtsmoos_bootstrap_flat_world';
	group.userData.bootstrapTerrain = true;
	const forest = createForestState();
	const textLandmark = createLandmarkState();
	const stats = {
		bootstrap: true,
		deferredTerrainEnrichment: 'authored-valley-dormant',
		forestStats: forest.stats,
		groundSampler: 'bootstrap-flat-ground',
		quality: 'bootstrap',
		renderDpr: 1,
		terrainPreparation: { mode: 'flat-bootstrap', steps: 0 }
	};
	const worldMetadata = {
		bootstrap: true,
		deferredTerrainEnrichment: true,
		forest: forest.stats,
		houses: [],
		quality: 'bootstrap',
		stairLayouts: [],
		terrainGridSteps: 0,
		terrainPreparation: { mode: 'flat-bootstrap', steps: 0 },
		textLandmark: textLandmark.stats,
		village: { status: 'dormant' }
	};
	return {
		colliders: [],
		deferredTerrainContext: {
			colliderStore: [],
			forest,
			groundSampler: null,
			halfSize: 1024,
			obstacleTriangles: [],
			quality: 'bootstrap',
			roadTriangles: [],
			textLandmark
		},
		forest,
		group,
		heightAt: () => 0,
		materialDiagnostics: { mode: 'clear-only-bootstrap', materials: 0 },
		roadStats: { colliders: 0, status: 'dormant' },
		signTexturePromise: Promise.resolve({ status: 'dormant' }),
		stats,
		textLandmark,
		village: { definitions: [], stats: { status: 'dormant' } },
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
		stats: { status: 'dormant' }
	};
}
