// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiCinema.test.mjs
 * @description Proves one frozen cinema API owns preparation, safety, quieter flagship authoring, render progress, waiting, and cancellation.
 * The Awtsmoos renews public method and private queue without confusion; Awtsmoos.com verifies
 * canonical Chossid readiness precedes installation while six patient scenes remain exactly one minute.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MOVIE_API_CAPABILITIES, MOVIE_API_VERSION } from '../../movie/MovieApiConstants.js';
import { MovieApiError } from '../../movie/MovieApiError.js';
import { createMovieStudioCinemaDomain } from '../../movie/MovieStudioApiCinema.js';

const API_KEYS = [
	'analyze', 'apply', 'assetStatus', 'cancelRender', 'capabilities', 'codecReport',
	'compile', 'contract', 'flagship', 'getRender', 'listRenders', 'prepare',
	'renderFlagship', 'renderPlan', 'renderProgress', 'validate', 'waitForRender'
];

test('cinema domain publishes immutable preparation, authoring, and render contracts', () => {
	const cinema = createMovieStudioCinemaDomain(createSession());
	assert.equal(Object.isFrozen(cinema), true);
	assert.deepEqual(Object.keys(cinema).sort(), API_KEYS);
	const contract = cinema.contract();
	assert.deepEqual(contract.methods, API_KEYS);
	assert.equal(contract.flagship.expectedFrames, 1440);
	assert.equal(contract.flagship.minimumScenes, 6);
	assert.equal(contract.capabilities.assetPreparation, true);
	assert.equal(contract.capabilities.noProceduralFinalHumans, true);
});

test('apply refuses unprepared humans and succeeds after preparation', async () => {
	const session = createSession();
	const cinema = createMovieStudioCinemaDomain(session);
	const manifest = cinema.flagship();
	assert.equal(manifest.scenes.length, 6);
	assert.equal(cinema.assetStatus(manifest).ready, false);
	const rejected = cinema.apply(manifest);
	assert.equal(rejected.ok, false);
	assert.equal(rejected.error.code, 'CINEMA_CHOSSID_ASSETS_NOT_READY');
	const prepared = await cinema.prepare(manifest);
	assert.equal(prepared.ok, true);
	assert.equal(prepared.value.requiredChossidActors, 8);
	assert.equal(cinema.assetStatus(manifest).ready, true);
	const applied = cinema.apply(manifest);
	assert.equal(applied.ok, true);
	assert.equal(applied.value.project.duration, 60);
});

test('cinema jobs prepare automatically and expose frame-aware phase metadata', async () => {
	const session = createSession();
	const cinema = createMovieStudioCinemaDomain(session);
	const started = await cinema.renderFlagship({ download: true });
	assert.equal(started.ok, true);
	assert.equal(started.value.analysis.expectedFrames, 1440);
	assert.equal(started.value.analysis.sceneCount, 6);
	assert.equal(started.value.assets.ready, true);
	assert.equal(started.value.job.request.metadata.sceneCount, 6);
	assert.equal(started.value.job.cinemaProgress.encodedFrameEstimate, 360);
	assert.equal(started.value.job.cinemaProgress.videoPercent, 25);
	assert.equal(started.value.job.cinemaProgress.phase, 'video');
	assert.equal(cinema.listRenders().length, 1);
	const waited = await cinema.waitForRender('cinema-1');
	assert.equal(waited.ok, true);
	assert.equal(waited.value.cinemaProgress.phase, 'completed');
	const cancelled = cinema.cancelRender('cinema-1', 'operator request');
	assert.equal(cancelled.value.cancelled, true);
});

test('metadata advertises the cinema upgrade', () => {
	assert.equal(MOVIE_API_VERSION, '2.1.0');
	assert.equal(MOVIE_API_CAPABILITIES.cinemaAuthoring, true);
	assert.equal(MOVIE_API_CAPABILITIES.longFormWebCodecs, true);
	assert.equal(MOVIE_API_CAPABILITIES.humanSafetyValidation, true);
});

function createSession() {
	const jobs = new Map();
	let ready = false;
	const session = {
		cinemaAssets: {
			assertReady() {
				if (!ready) throw new MovieApiError(
					'CINEMA_CHOSSID_ASSETS_NOT_READY',
					'Prepared Chossid actors are required.',
					{ ready: 0, required: 8 }
				);
				return { ready: true, requiredChossidActors: 8 };
			},
			async prepare() { ready = true; return { ready: true, requiredChossidActors: 8 }; },
			status() { return { ready, requiredChossidActors: 8 }; }
		},
		commands: { commitProject: project => { session.project = project; session.revision += 1; } },
		events: { emit() {} },
		project: null,
		revision: 2,
		renderQueue: {
			cancel: id => ({ cancelled: true, job: jobs.get(id) }),
			get: id => ({ snapshot: () => jobs.get(id) }),
			list: () => [...jobs.values(), otherJob()],
			start: request => { const job = cinemaJob(request); jobs.set(job.id, job); return job; },
			wait: async id => ({ ...jobs.get(id), progress: 1, state: 'completed' })
		}
	};
	return session;
}

function cinemaJob(request) {
	return { createdAt: '2026-08-02T00:00:00Z', id: 'cinema-1', progress: 0.235, request, state: 'rendering' };
}

function otherJob() {
	return { id: 'other-1', progress: 0, request: {}, state: 'queued' };
}
