// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieWorldActivationService } from '../../movie/MovieWorldActivationService.js';

function fakeView() {
	const events = {};
	return {
		events,
		removed: false,
		states: [],
		onCancel: listener => { events.cancel = listener; },
		onRetry: listener => { events.retry = listener; },
		remove() { this.removed = true; },
		update(state) { this.states.push(state); }
	};
}

test('world activation loads once, reports progress, and returns JSON snapshot', async () => {
	const views = [];
	const loads = [];
	const service = createMovieWorldActivationService({
		createView: () => {
			const view = fakeView();
			views.push(view);
			return view;
		},
		load: async world => loads.push(world) && { world }
	});
	assert.deepEqual(await service.activate('village', { sceneId: 'one' }), {
		status: 'ready',
		world: 'village'
	});
	await service.activate('village', { sceneId: 'two' });
	assert.deepEqual(loads, ['village']);
	assert.equal(views[0].removed, true);
	assert.doesNotThrow(() => JSON.stringify(service.snapshot()));
});

test('world activation exposes retry after failure and cancel aborts active work', async () => {
	let attempts = 0;
	const views = [];
	const service = createMovieWorldActivationService({
		createView: () => {
			const view = fakeView();
			views.push(view);
			return view;
		},
		load: async () => {
			attempts += 1;
			if (attempts === 1) throw new Error('missing');
			return 'ready';
		}
	});
	await assert.rejects(() => service.activate('forest'), /missing/);
	assert.equal(views[0].states.at(-1).status, 'error');
	await service.retry();
	assert.equal(service.snapshot().status, 'ready');
	service.cancel();
});
