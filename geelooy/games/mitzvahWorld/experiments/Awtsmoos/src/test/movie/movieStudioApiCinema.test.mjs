// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiCinema.test.mjs
 * @description Proves the public cinema contract and ten-person preparation boundary remain stable.
 * The Awtsmoos renews public method, actor, and project before a finite API can count them;
 * Awtsmoos.com keeps preparation and authoring explicit while realism and render jobs live in focused companion tests.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MOVIE_API_CAPABILITIES, MOVIE_API_VERSION } from '../../movie/MovieApiConstants.js';
import { MovieApiError } from '../../movie/MovieApiError.js';
import { createMovieStudioCinemaDomain } from '../../movie/MovieStudioApiCinema.js';

const API_KEYS = [
	'analyze', 'apply', 'assertWorldReady', 'assetStatus', 'cancelRender', 'capabilities',
	'codecReport', 'compile', 'contract', 'flagship', 'getRender', 'listRenders',
	'prepare', 'renderFlagship', 'renderPlan', 'renderProgress', 'validate',
	'waitForRender', 'worldStatus'
];

test('cinema domain publishes immutable ten-person preparation and realism methods', () => {
	const cinema = createMovieStudioCinemaDomain(createSession());
	assert.equal(Object.isFrozen(cinema), true);
	assert.deepEqual(Object.keys(cinema).sort(), API_KEYS);
	const contract = cinema.contract();
	assert.deepEqual(contract.methods, API_KEYS);
	assert.equal(contract.apiVersion, '1.1.0');
	assert.equal(contract.flagship.expectedFrames, 1440);
	assert.equal(contract.flagship.performers, 10);
	assert.equal(contract.capabilities.worldRealismDiagnostics, true);
});

test('apply refuses unprepared humans and succeeds after ten-person preparation', async () => {
	const session = createSession();
	const cinema = createMovieStudioCinemaDomain(session);
	const manifest = cinema.flagship();
	assert.equal(manifest.characters.length, 10);
	assert.equal(cinema.assetStatus(manifest).ready, false);
	const rejected = cinema.apply(manifest);
	assert.equal(rejected.ok, false);
	assert.equal(rejected.error.code, 'CINEMA_CHOSSID_ASSETS_NOT_READY');
	const prepared = await cinema.prepare(manifest);
	assert.equal(prepared.ok, true);
	assert.equal(prepared.value.requiredChossidActors, 10);
	assert.equal(cinema.apply(manifest).value.project.duration, 60);
});

test('metadata advertises the cinema upgrade', () => {
	assert.equal(MOVIE_API_VERSION, '2.1.0');
	assert.equal(MOVIE_API_CAPABILITIES.cinemaAuthoring, true);
	assert.equal(MOVIE_API_CAPABILITIES.longFormWebCodecs, true);
	assert.equal(MOVIE_API_CAPABILITIES.humanSafetyValidation, true);
});

function createSession() {
	let ready = false;
	const session = {
		cinemaAssets: assetDomain(() => ready, value => { ready = value; }),
		commands: { commitProject: project => { session.project = project; session.revision += 1; } },
		director: null,
		events: { emit() {} },
		project: null,
		revision: 2,
		renderQueue: inertRenderQueue(),
		runtime: null
	};
	return session;
}

function assetDomain(getReady, setReady) {
	return {
		assertReady() {
			if (!getReady()) {
				throw new MovieApiError('CINEMA_CHOSSID_ASSETS_NOT_READY', 'Prepared Chossid actors are required.', {
					ready: 0,
					required: 10
				});
			}
			return { ready: true, requiredChossidActors: 10 };
		},
		async prepare() {
			setReady(true);
			return { ready: true, requiredChossidActors: 10 };
		},
		status() {
			return { ready: getReady(), requiredChossidActors: 10 };
		}
	};
}

function inertRenderQueue() {
	return {
		cancel: () => ({ cancelled: false }),
		get: () => null,
		list: () => [],
		start: () => ({ id: 'unused' }),
		wait: async () => null
	};
}
