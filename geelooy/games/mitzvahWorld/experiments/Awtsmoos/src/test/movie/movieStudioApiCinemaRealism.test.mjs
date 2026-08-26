// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiCinemaRealism.test.mjs
 * @description Proves final cinema requires mounted homes beside cast, water, vegetation, trees, mountains, and render-job truth.
 * The Awtsmoos renews threshold, river, ridge, cedar, garment, queue, and frame before finite diagnostics can certify them;
 * Awtsmoos.com tests the same strict preflight the real Movie Maker must satisfy before frame zero.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioCinemaDomain } from '../../movie/MovieStudioApiCinema.js';

test('worldStatus requires material-ready mounted houses and the complete living world', () => {
	const cinema = createMovieStudioCinemaDomain(createSession());
	const receipt = cinema.worldStatus();
	assert.equal(receipt.ready, true);
	assert.equal(receipt.cast.count, 10);
	assert.equal(receipt.cast.outfitIds.length, 10);
	assert.equal(receipt.houses.mounted, true);
	assert.ok(receipt.houses.houses >= 1);
	assert.ok(receipt.houses.materialsReady >= 1);
	assert.equal(receipt.water.shader, 'textured-dual-normal-flowing-water');
	assert.match(receipt.water.physicalShader, /physical-water/i);
	assert.equal(receipt.trees.authority, 'Awtsmoos_canonical_procedural_ecology_forest');
	assert.ok(receipt.mountains.meshes >= 2);
	assert.equal(cinema.assertWorldReady().ready, true);
});

test('render begins only after strict world preflight and returns its receipt', async () => {
	const cinema = createMovieStudioCinemaDomain(createSession());
	const started = await cinema.renderFlagship({ download: true, worldTimeoutMs: 500 });
	assert.equal(started.ok, true);
	assert.equal(started.value.analysis.expectedFrames, 1440);
	assert.equal(started.value.assets.ready, true);
	assert.equal(started.value.world.ready, true);
	assert.equal(started.value.world.houses.mounted, true);
	assert.equal(started.value.job.cinemaProgress.videoPercent, 25);
	assert.equal(cinema.listRenders().length, 1);
	assert.equal((await cinema.waitForRender('cinema-1')).value.cinemaProgress.phase, 'completed');
	assert.equal(cinema.cancelRender('cinema-1', 'operator request').value.cancelled, true);
});

function createSession() {
	const jobs = new Map();
	const runtime = realisticRuntime();
	const session = {
		cinemaAssets: preparedAssets(),
		commands: { commitProject: project => { session.project = project; session.revision += 1; } },
		director: realisticDirector(),
		events: { emit() {} },
		project: null,
		revision: 2,
		renderQueue: renderQueue(jobs),
		runtime
	};
	return session;
}

function preparedAssets() {
	return {
		assertReady: () => ({ ready: true, requiredChossidActors: 10 }),
		prepare: async () => ({ ready: true, requiredChossidActors: 10 }),
		status: () => ({ ready: true, requiredChossidActors: 10 })
	};
}

function realisticRuntime() {
	const runtime = { camera: {}, renderer: {}, scene: {} };
	runtime.houses = {
		diagnostics: () => ({ doors: 8, houses: 8, materialsReady: 6, rooms: 14, stairs: 5 }),
		group: { parent: runtime.scene },
		runtime
	};
	runtime.mountains = { diagnostics: () => ({ belts: 4, layeredMaterials: true, meshes: 8, mounted: true, placementModel: 'authored-source-walls-outlet-pass', snowCaps: 4 }) };
	runtime.trees = { diagnostics: () => ({ authority: 'Awtsmoos_canonical_procedural_ecology_forest', ecologyTaggedTrees: 32, mounted: true, trees: 32, visibleTrees: 32 }) };
	runtime.vegetation = { diagnostics: () => ({ clumps: 894, mounted: true }) };
	runtime.water = { diagnostics: () => ({ activeNormalSources: 2, flowLayers: 4, lakeVertices: 365, physicalShader: 'awtsmoos-physical-water-v1', riverVertices: 98, shader: 'textured-dual-normal-flowing-water', waterMeshes: 2 }) };
	return runtime;
}

function realisticDirector() {
	const records = new Map();
	for (let index = 0; index < 10; index += 1) records.set(`actor-${index}`, {
		actor: { outfitId: `outfit-${index}` },
		borrowed: true,
		figure: { userData: { AwtsmoosMovieCharacter: { canonicalModel: 'assets/models/player/chossid.glb' } } }
	});
	return { crowd: { records } };
}

function renderQueue(jobs) {
	return {
		cancel: id => ({ cancelled: true, job: jobs.get(id) }),
		get: id => ({ snapshot: () => jobs.get(id) }),
		list: () => [...jobs.values(), { id: 'other-1', progress: 0, request: {}, state: 'queued' }],
		start: request => {
			const job = { createdAt: '2026-08-02T00:00:00Z', id: 'cinema-1', progress: 0.235, request, state: 'rendering' };
			jobs.set(job.id, job);
			return job;
		},
		wait: async id => ({ ...jobs.get(id), progress: 1, state: 'completed' })
	};
}
