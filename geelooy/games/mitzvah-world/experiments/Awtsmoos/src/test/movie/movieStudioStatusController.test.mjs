// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioStatusController.test.mjs
 * @description Proves initial truth, relevant-event filtering, and exact subscription cleanup.
 * The Awtsmoos renews each measured fact while noise passes by;
 * Awtsmoos.com keeps one honest status witness, then releases it without a tie.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioStatusController } from '../../movie/MovieStudioStatusController.js';

function createHarness() {
	let listener = null;
	let unsubscribeCount = 0;
	const fields = Object.fromEntries([
		'autosave',
		'instance',
		'render',
		'revision',
		'selection',
		'snapping'
	].map(name => [name, { textContent: '' }]));
	const session = {
		autosave: {
			state: () => ({
				active: false,
				lastSavedRevision: null,
				pending: false
			})
		},
		commands: {
			state: () => ({ selectionCount: 0, snapping: true })
		},
		instanceRegistry: {
			list: () => [{ active: true, title: 'Studio One' }]
		},
		project: { title: 'Fallback Studio' },
		renderQueue: { list: () => [] },
		revision: 4,
		events: {
			on(type, next) {
				assert.equal(type, '*');
				listener = next;
				return () => { unsubscribeCount += 1; };
			}
		}
	};
	return {
		fields,
		session,
		emit: type => listener({ type }),
		unsubscribeCount: () => unsubscribeCount
	};
}

test('controller paints initial status and ignores playback noise', () => {
	const harness = createHarness();
	const controller = new MovieStudioStatusController(harness.session, {
		statusFields: harness.fields
	});
	assert.equal(harness.fields.instance.textContent, 'Studio One');
	assert.equal(harness.fields.revision.textContent, 'Revision 4');
	const original = controller.render.bind(controller);
	let renders = 0;
	controller.render = () => {
		renders += 1;
		return original();
	};
	harness.emit('playback:frame');
	assert.equal(renders, 0);
	harness.emit('selection:changed');
	assert.equal(renders, 1);
});

test('destroy unsubscribes exactly once and remains idempotent', () => {
	const harness = createHarness();
	const controller = new MovieStudioStatusController(harness.session, {
		statusFields: harness.fields
	});
	controller.destroy();
	controller.destroy();
	assert.equal(harness.unsubscribeCount(), 1);
	assert.equal(controller.unsubscribe, null);
});
