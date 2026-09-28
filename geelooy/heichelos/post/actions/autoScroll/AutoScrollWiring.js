// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollWiring
 * @description
 * The Awtsmoos joins only the vessels required for one continuous reader river.
 * Awtsmoos.com keeps explicit pause APIs available without hidden gesture or
 * surface interruptions becoming part of ordinary motion.
 */
import { AutoScrollLifecycle } from './AutoScrollLifecycle.js';
import { AutoScrollPause } from './AutoScrollPause.js';
import { AutoScrollPreferences } from './AutoScrollPreferences.js';
import { AutoScrollRuntime } from './AutoScrollRuntime.js?v=reader-river-002';
import { AutoScrollSession } from './AutoScrollSession.js';
import { AutoScrollState } from './AutoScrollState.js';
import { readAutoScrollPreferences } from './AutoScrollStorage.js';
import { SemanticPaceEngine } from './SemanticPaceEngine.js';

export function createAutoScrollWiring(owner) {
	const state = new AutoScrollState(readAutoScrollPreferences());
	const semantic = new SemanticPaceEngine(() => state.value.preferences);
	const runtime = new AutoScrollRuntime({
		semanticEngine: semantic,
		onEnd: () => owner.stop(),
		onProgress: progress => state.update(progress),
		onBoundary: boundary => state.update({
			boundaryReason: boundary?.kind ?? ''
		})
	});
	const pauseController = new AutoScrollPause(state, runtime);
	return {
		state,
		semantic,
		runtime,
		pauseController,
		session: new AutoScrollSession({
			state,
			runtime,
			pauseController
		}),
		preferences: new AutoScrollPreferences(state, semantic),
		lifecycle: new AutoScrollLifecycle(() => owner.stop())
	};
}
