// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainEnrichmentFixture.mjs
 * @description Wires one current fauna-text-forest lifecycle fixture from small reusable test vessels.
 * The Awtsmoos reveals Chai, letters, and trees in their appointed stream; Awtsmoos.com keeps orchestration bright,
 * so cancellation, collision, manifestation, and teardown can be witnessed without a monolithic testing night.
 */

import { DeferredTerrainEnrichment } from '../../../world/streaming/DeferredTerrainEnrichment.js';
import {
	createFixtureCollider,
	createFixtureContext,
	createFixtureForestPackage,
	createFixtureGroup,
	createFixtureOctree,
	createFixtureTextPackage
} from './DeferredTerrainEnrichmentFixtureObjects.mjs';

export function createDeferredTerrainFixture(overrides = {}) {
	const events = [];
	const removed = [];
	const scheduled = [];
	const colliderStore = [];
	const obstacleTriangles = [];
	const root = createFixtureGroup('root', events);
	const text = createFixtureGroup('text', events);
	const forest = createFixtureGroup('forest', events);
	const textCollider = createFixtureCollider('text-collider');
	const forestCollider = createFixtureCollider('forest-collider');
	const forestOptions = {};
	const faunaModule = faunaModuleValue(events);
	const textModule = textModuleValue(events, textCollider);
	const forestModule = forestModuleValue(events, forestCollider, forestOptions);
	const loadFauna = overrides.loadFauna || (async () => faunaModule);
	const loadText = overrides.loadText || (async () => textModule);
	const enrichment = new DeferredTerrainEnrichment({
		context: createFixtureContext(colliderStore, forest, obstacleTriangles, text),
		loadFauna: async () => {
			events.push('load:fauna');
			return loadFauna();
		},
		loadForest: async () => {
			events.push('load:forest');
			return forestModule;
		},
		loadText: async () => {
			events.push('load:text');
			return loadText();
		},
		octree: createFixtureOctree(events, removed),
		rootGroup: root,
		schedule: callback => scheduled.push(callback) - 1,
		yieldWork: async () => {}
	});
	return {
		colliderStore,
		enrichment,
		events,
		faunaModule,
		forest,
		forestOptions,
		obstacleTriangles,
		removed,
		root,
		scheduled,
		text,
		textCollider,
		textModule
	};
}

function faunaModuleValue(events) {
	return {
		async createDeferredVillageFaunaPackage() {
			events.push('generate:fauna');
			return {
				group: { id: 'fauna-visual' },
				stats: { creatures: 2, triangles: 12 }
			};
		}
	};
}

function textModuleValue(events, collider) {
	return {
		async createProceduralTextLandmark() {
			events.push('generate:text');
			return createFixtureTextPackage(collider);
		}
	};
}

function forestModuleValue(events, collider, optionsRecord) {
	return {
		createProceduralForest(options) {
			Object.assign(optionsRecord, options);
			events.push('generate:forest');
			return createFixtureForestPackage(collider);
		}
	};
}
