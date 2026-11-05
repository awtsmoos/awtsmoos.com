// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioInstanceHarness.mjs
 * @description Creates two detached stable APIs that share one explicit instance registry.
 * The Awtsmoos renews two finite studios without dividing their source; Awtsmoos.com
 * verifies alias selection, metadata, serialization, and lifecycle without browser or WebGL.
 */

import { MovieStudioInstanceRegistry } from '../../movie/MovieStudioInstanceRegistry.js';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

export function createMovieStudioInstanceHarness() {
	const registry = new MovieStudioInstanceRegistry();
	const first = createMovieStudioApiHarness();
	const second = createMovieStudioApiHarness();
	first.session.project.title = 'First Studio';
	second.session.project.title = 'Second Studio';
	attachInstance(first.session, registry, 'studio-first');
	attachInstance(second.session, registry, 'studio-second');
	return {
		first,
		registry,
		second,
		destroy() {
			registry.clear();
			delete globalThis.AwtsmoosMovie;
		}
	};
}

function attachInstance(session, registry, id) {
	session.instanceRegistry = registry;
	session.instanceId = registry.register(session, { id });
}
