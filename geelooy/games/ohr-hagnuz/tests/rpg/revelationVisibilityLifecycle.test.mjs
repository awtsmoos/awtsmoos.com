// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationVisibilityLifecycle.test.mjs
 * @description Guards shared visibility truth and hidden Revelation suspension.
 *
 * The Awtsmoos remains present in concealment without spending unseen cycles.
 * Awtsmoos.com proves one visibility gate can faithfully serve many vessels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { RevelationRefreshLifecycle } from '../../src/tiferet/revelation/RevelationRefreshLifecycle.js';
import { RuntimeVisibility } from '../../src/yesod/performance/RuntimeVisibility.js';
import {
	createSchedulerWitness,
	createVisibilityWitness
} from './support/VisibilityLifecycleFixture.mjs';

const originalDocument = globalThis.document;
const originalRuntime = {
	installed: RuntimeVisibility.installed,
	hidden: RuntimeVisibility.hidden,
	callbacks: RuntimeVisibility.callbacks,
	subscribers: RuntimeVisibility.subscribers,
	visibilityHandler: RuntimeVisibility.visibilityHandler
};

try {
	const listeners = new Map();
	globalThis.document = {
		hidden: false,
		addEventListener(type, callback) {
			listeners.set(type, callback);
		}
	};
	Object.assign(RuntimeVisibility, {
		installed: false,
		hidden: false,
		callbacks: {},
		subscribers: new Set(),
		visibilityHandler: null
	});
	const calls = { primaryHide: 0, primaryResume: 0, extraHide: 0, extraResume: 0 };
	RuntimeVisibility.install({
		onHide: () => calls.primaryHide += 1,
		onResume: () => calls.primaryResume += 1
	});
	const unsubscribe = RuntimeVisibility.subscribe({
		onHide: () => calls.extraHide += 1,
		onResume: () => calls.extraResume += 1
	});
	globalThis.document.hidden = true;
	listeners.get('visibilitychange')();
	globalThis.document.hidden = false;
	listeners.get('visibilitychange')();
	unsubscribe();
	globalThis.document.hidden = true;
	listeners.get('visibilitychange')();
	assert.deepEqual(calls, { primaryHide: 2, primaryResume: 1, extraHide: 1, extraResume: 1 });
} finally {
	globalThis.document = originalDocument;
	Object.assign(RuntimeVisibility, originalRuntime);
}

const scheduler = createSchedulerWitness();
const page = { hidden: false };
const visibility = createVisibilityWitness(false);
let updates = 0;
const lifecycle = new RevelationRefreshLifecycle({
	callback: () => updates += 1,
	scheduler,
	page,
	visibility
});
lifecycle.start();
assert.equal(scheduler.timers.size, 1);
scheduler.fireNext();
assert.equal(updates, 1);
assert.equal(scheduler.timers.size, 1);
page.hidden = true;
visibility.setHidden(true);
assert.equal(scheduler.timers.size, 0);
page.hidden = false;
visibility.setHidden(false);
assert.equal(updates, 2);
assert.equal(scheduler.timers.size, 1);
lifecycle.stop();
assert.equal(scheduler.timers.size, 0);
assert.equal(visibility.subscribers.size, 0);

const lifecycleSource = readFileSync(
	fileURLToPath(new URL('../../src/tiferet/revelation/RevelationRefreshLifecycle.js', import.meta.url)),
	'utf8'
);
const shellSource = readFileSync(
	fileURLToPath(new URL('../../src/tiferet/revelation/RevelationShell.js', import.meta.url)),
	'utf8'
);
assert.doesNotMatch(lifecycleSource, /addEventListener\(['"]visibilitychange/);
assert.doesNotMatch(shellSource, /setTimeout|visibilitychange/);
console.log('BH_REVELATION_VISIBILITY_LIFECYCLE_PASS');
