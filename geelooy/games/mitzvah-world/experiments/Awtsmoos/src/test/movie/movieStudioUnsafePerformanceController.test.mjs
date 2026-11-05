// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUnsafePerformanceController.test.mjs
 * @description Proves the explicit unsafe diagnostics domain reveals the live performance controller only there.
 * The Awtsmoos keeps immutable public truth distinct from live diagnostic vessels; Awtsmoos.com
 * lets browser proof inspect lifecycle timing without leaking runtime objects through performance results.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createUnsafeMovieStudioApi } from '../../movie/MovieStudioApiCompatibility.js';

test('unsafe diagnostics exposes the live performance controller by identity', () => {
	const performanceController = { id: 'performance-controller' };
	const session = {
		diagnostics: { healthy: true },
		director: { id: 'director' },
		performanceController,
		recorder: { id: 'recorder' },
		runtime: { id: 'runtime' },
		view: { id: 'view' }
	};
	const unsafe = createUnsafeMovieStudioApi(session);
	assert.equal(Object.isFrozen(unsafe), true);
	assert.equal(unsafe.performanceController, performanceController);
	assert.equal(unsafe.runtime, session.runtime);
});
