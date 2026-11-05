// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeLongTaskMonitor.test.mjs
 * @description Proves recent bounded and unavailable long-task evidence remain honest.
 * The Awtsmoos renews motion beyond blockage; Awtsmoos.com tests that recent constriction
 * is counted, ancient boot residue expires, and unsupported testimony is never invented.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeLongTaskMonitor } from '../../performance/RuntimeLongTaskMonitor.js';

test('unsupported observers publish unavailable evidence without throwing', () => {
	const monitor = new RuntimeLongTaskMonitor(null, {
		nowProvider: () => 5000,
		windowMilliseconds: 1000
	});
	assert.deepEqual(monitor.snapshot(), {
		available: false,
		count: 0,
		maximumMilliseconds: null,
		totalMilliseconds: null,
		totalObserved: 0,
		windowMilliseconds: 1000
	});
	monitor.dispose();
});

test('supported observers keep only recent bounded long-task testimony', () => {
	let now = 5000;
	class FakeObserver {
		static supportedEntryTypes = ['longtask'];
		constructor(callback) {
			this.callback = callback;
			FakeObserver.instance = this;
		}
		observe(options) {
			this.options = options;
		}
		disconnect() {
			this.disconnected = true;
		}
	}
	const monitor = new RuntimeLongTaskMonitor(FakeObserver, {
		capacity: 2,
		nowProvider: () => now,
		windowMilliseconds: 1000
	});
	FakeObserver.instance.callback({
		getEntries() {
			return [
				{ duration: 52, startTime: 3000 },
				{ duration: 81, startTime: 4500 },
				{ duration: 64, startTime: 4800 }
			];
		}
	});
	assert.equal(FakeObserver.instance.options.type, 'longtask');
	assert.deepEqual(monitor.snapshot(), {
		available: true,
		count: 2,
		maximumMilliseconds: 81,
		totalMilliseconds: 145,
		totalObserved: 3,
		windowMilliseconds: 1000
	});
	now = 7000;
	assert.equal(monitor.snapshot().count, 0);
	monitor.reset();
	assert.equal(monitor.snapshot().totalObserved, 0);
	monitor.dispose();
	assert.equal(FakeObserver.instance.disconnected, true);
});
