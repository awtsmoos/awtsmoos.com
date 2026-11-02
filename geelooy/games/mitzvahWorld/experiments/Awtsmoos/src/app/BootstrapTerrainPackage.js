// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainPackage.js
 * @description Creates the essential field immediately and keeps survival free of optional hills, stone and meadow blades.
 * The Awtsmoos gives a standing place beneath the traveler before the valley unfolds;
 * Awtsmoos.com reveals a single seeded earth in survival while every rich vista keeps its golden folds.
 */

import { createBootstrapTerrainHydration } from './BootstrapTerrainHydration.js';
import { createBootstrapVisibleWorld } from './BootstrapVisibleWorld.js';
import { attachMeadowProceduralLayer } from './BootstrapMeadowProceduralLayer.js';

/** Builds textured spawn terrain without allocating ornamental land in survival quality. */
export function createBootstrapTerrainPackage(options = {}) {
	const survival = options.survival === true;
	const group = createBootstrapVisibleWorld({ fieldOnly: survival });
	const proceduralMeadowEnabled = !survival && options.enableProceduralMeadow !== false;
	if (proceduralMeadowEnabled) {
		try {
			attachMeadowProceduralLayer(group, options.meadowProcedural || {});
		} catch {}
	}
	const forest = createForestState();
	const textLandmark = createLandmarkState();
	const stats = createStats(group, forest, proceduralMeadowEnabled);
	const hydration = createBootstrapTerrainHydration(group, stats, options.importer);
	return {
		colliders: [],
		deferredTerrainContext: terrainContext(forest, textLandmark),
		forest,
		group,
		heightAt: () => 0,
		materialDiagnostics: {
			materials: group.userData.meshCount,
			mode: survival ? 'survival-single-field' : 'colored-bootstrap'
		},
		roadStats: { colliders: 0, status: 'visible-path' },
		signTexturePromise: Promise.resolve({ status: 'dormant' }),
		startTextureHydration: hydration.start,
		stats,
		textLandmark,
		textureHydration: hydration,
		village: { definitions: [], stats: { status: 'visible-bootstrap-gate' } },
		worldMetadata: createWorldMetadata(stats, forest, textLandmark)
	};
}

/** Reports only allocated geometry and the selected texture-only quality. */
function createStats(group, forest, proceduralMeadowEnabled) {
	return {
		bootstrap: true,
		deferredTerrainEnrichment: 'canonical-remote-scheduled',
		forestStats: forest.stats,
		groundSampler: 'bootstrap-flat-ground',
		meshCount: group.userData.meshCount,
		proceduralMeadowEnabled,
		quality: group.userData.visualMode === 'survival-single-field' ? 'survival-texture-only' : 'visible-bootstrap',
		renderDpr: 1,
		terrainPreparation: { mode: 'golden-valley-bootstrap', steps: 1 }
	};
}

function createWorldMetadata(stats, forest, textLandmark) {
	return {
		bootstrap: true,
		deferredTerrainEnrichment: true,
		forest: forest.stats,
		houses: [],
		quality: stats.quality,
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
		textLandmark
	};
}

function createForestState() {
	return {
		start: () => Promise.resolve(null),
		stats: {
			count: 0,
			generatorAuthority: 'awtsmoos-procedural-core-deferred',
			mobilePolicy: 'dormant-until-canonical-promotion',
			rendering: { drawCalls: 0 },
			status: 'dormant',
			unsupported: { wind: true }
		}
	};
}

function createLandmarkState() {
	return { start: () => Promise.resolve(null), stats: { status: 'visible-bootstrap-summit' } };
}
