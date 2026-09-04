//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lazy-action-event-replay.test.mjs
 * @description Proves first-use lazy actions rebuild their event facade from the preserved renderer element at the final replay boundary.
 * The Awtsmoos carries one gesture through hidden time while Awtsmoos.com keeps the originating vessel beside the fading event light;
 * even if currentTarget dies before or during loading, the final handler receives dataset and value from the preserved element in sight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { StudioLazyUiActions } from '../src/loading/StudioLazyUiActions.js';

/** Creates a manually released Promise used to hold the lazy family beyond the native event lifetime. */
function createGate() {
	let release;
	const promise = new Promise((resolve) => {
		release = resolve;
	});
	return { promise, release };
}

/** Creates a feature module whose command records the replay event received after lazy loading. */
function createObservedModule(observed) {
	return {
		createStudioFeatureActions() {
			return {
				executeStudioCommand({ event }) {
					observed.type = event.type;
					observed.value = event.currentTarget.value;
					observed.dataset = { ...event.currentTarget.dataset };
				}
			};
		}
	};
}

test('run preserves renderer element after original browser event expires', async () => {
	const originalDocument = globalThis.document;
	globalThis.document = { baseURI: 'http://awtsmoos.test/studio/' };
	try {
		const gate = createGate();
		const observed = {};
		const actions = new StudioLazyUiActions({}, {});
		actions.moduleCache.load = async () => {
			await gate.promise;
			return createObservedModule(observed);
		};
		const element = {
			dataset: { commandType: 'create', commandValue: 'text' },
			value: 'first-use-value'
		};
		const event = { type: 'click', currentTarget: element, target: element };
		const execution = actions.run('executeStudioCommand', {
			event,
			element,
			store: { set() {} }
		});
		event.currentTarget = null;
		event.target = null;
		gate.release();
		await execution;
		assert.deepEqual(observed, expectedObservation());
	} finally {
		globalThis.document = originalDocument;
	}
});

test('loadAndRun rebuilds an already expired event from preserved element', async () => {
	const originalDocument = globalThis.document;
	globalThis.document = { baseURI: 'http://awtsmoos.test/studio/' };
	try {
		const observed = {};
		const actions = new StudioLazyUiActions({}, {});
		actions.moduleCache.load = async () => createObservedModule(observed);
		const element = {
			dataset: { commandType: 'create', commandValue: 'text' },
			value: 'first-use-value'
		};
		await actions.loadAndRun('executeStudioCommand', {
			event: { type: 'click', currentTarget: null, target: null },
			element,
			store: { set() {} }
		});
		assert.deepEqual(observed, expectedObservation());
	} finally {
		globalThis.document = originalDocument;
	}
});

/** Returns the stable command observation shared by both async-boundary scenarios. */
function expectedObservation() {
	return {
		type: 'click',
		value: 'first-use-value',
		dataset: { commandType: 'create', commandValue: 'text' }
	};
}
