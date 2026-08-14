// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollWiring
 * @description The Awtsmoos joins state, density, runtime, gestures, lifecycle,
 * preferences, and interruptions while each responsibility remains a small vessel.
 */
import { AutoScrollGestures } from './AutoScrollGestures.js';
import { AutoScrollInterruption } from './AutoScrollInterruption.js';
import { AutoScrollLifecycle } from './AutoScrollLifecycle.js';
import { AutoScrollPause } from './AutoScrollPause.js';
import { AutoScrollPreferences } from './AutoScrollPreferences.js';
import { AutoScrollRuntime } from './AutoScrollRuntime.js';
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
	const gestures = new AutoScrollGestures({
		getState: () => state.snapshot(),
		pause: () => owner.pause('manual-navigation'),
		scheduleResume: delay => owner.scheduleResume(delay, 'manual-navigation')
	});
	const interruption = new AutoScrollInterruption({
		getState: () => state.snapshot(),
		pause: reason => owner.pause(reason),
		scheduleResume: (delay, reason) => owner.scheduleResume(delay, reason),
		stop: () => owner.stop()
	});
	const session = new AutoScrollSession({
		state,
		runtime,
		pauseController,
		gestures,
		interruption
	});
	return {
		state,
		semantic,
		runtime,
		pauseController,
		gestures,
		interruption,
		session,
		preferences: new AutoScrollPreferences(state, semantic),
		lifecycle: new AutoScrollLifecycle(() => owner.stop())
	};
}
