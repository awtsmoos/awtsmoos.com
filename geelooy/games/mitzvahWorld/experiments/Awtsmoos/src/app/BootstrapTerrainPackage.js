// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainPackage.js
 * @description Creates visible golden-valley earth with deferred canonical remote hydration.
 * The Awtsmoos reveals green ground before distant images arrive, then clothes that same vessel;
 * Awtsmoos.com preserves collision and geometry while exposing truthful remote-source authority.
 */

import {
	createBootstrapTerrainHydration
} from './BootstrapTerrainHydration.js';
import { createBootstrapVisibleWorld } from './BootstrapVisibleWorld.js';

export function createBootstrapTerrainPackage(options = {}) {
	const group = createBootstrapVisibleWorld();
	const forest = createForestState();
	const textLandmark = createLandmarkState();
	const stats = createStats(group, forest);
	const hydration = createBootstrapTerrainHydration(
		group,
		stats,
		options.importer
	);
	const worldMetadata = createWorldMetadata(stats, forest, textLandmark);
	return {
		colliders: [],
		deferredTerrainContext: terrainContext(forest, textLandmark),
		forest,
		group,
		heightAt: () => 0,
		materialDiagnostics: {
			materials: group.userData.meshCount,
			mode: 'colored-bootstrap'
		},
		roadStats: { colliders: 0, status: 'visible-path' },
		signTexturePromise: Promise.resolve({ status: 'dormant' }),
		startTextureHydration: hydration.start,
		stats,
		textLandmark,
		textureHydration: hydration,
		village: {
			definitions: [],
			stats: { status: 'visible-bootstrap-gate' }
		},
		worldMetadata
	};
}

function createStats(group, forest) {
	return {
		bootstrap: true,
		deferredTerrainEnrichment: 'canonical-remote-scheduled',
		forestStats: forest.stats,
		groundSampler: 'bootstrap-flat-ground',
		meshCount: group.userData.meshCount,
		quality: 'visible-bootstrap',
		renderDpr: 1,
		terrainPreparation: {
			mode: 'golden-valley-bootstrap',
			steps: 1
		}
	};
}

function createWorldMetadata(stats, forest, textLandmark) {
	return {
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
}

function terrainContext(forest, textLandmark) {
	return {
		colliderStore: [],
		forest,
		groundSampler: null,
		halfSize: 1024,
		obstacleTriangles: [],
		quality: 'visible-bootstrap',
		roadTriangles: [],
		textLandmark
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
