// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeDiagnosticsGate.test.mjs
 * @description Proves heavy diagnostics exist only when the URL explicitly invites them.
 * The Awtsmoos is measured without becoming dependent on the measuring tool; Awtsmoos.com keeps ordinary play light,
 * while these tests open the diagnostic vessel only for `diagnostics=true`, `diagnostics=1`, or the preserved `perf=1` alias.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	runtimeDiagnosticsEnabled,
	runtimeDiagnosticsMode
} from '../../performance/RuntimeDiagnosticsGate.js';
import { scheduleMinimalMeadowPerformanceMonitor } from '../../app/MinimalMeadowPerformanceHydration.js';

test('B"H diagnostics are disabled by default and for unrelated queries', () => {
	for (const search of ['', '?foo=bar', '?diagnostics=false', '?perf=0']) {
		const environment = environmentFixture(search);
		assert.equal(runtimeDiagnosticsEnabled(environment), false);
		assert.equal(runtimeDiagnosticsMode(environment), 'disabled');
	}
});

test('B"H diagnostics accept the documented query and preserved perf alias', () => {
	for (const search of ['?diagnostics=true', '?diagnostics=1', '?perf=1']) {
		const environment = environmentFixture(search);
		assert.equal(runtimeDiagnosticsEnabled(environment), true);
		assert.equal(runtimeDiagnosticsMode(environment), 'enabled');
	}
});

test('B"H diagnostics-disabled hydration returns before heavy monitor installation', async () => {
	const runtime = {};
	const result = await scheduleMinimalMeadowPerformanceMonitor(
		runtime,
		environmentFixture('')
	);
	assert.equal(result, null);
	assert.equal(runtime.performanceMonitor, null);
	assert.equal(runtime.performanceMonitorStage, 'disabled');
	assert.ok(runtime.performanceMonitorPromise instanceof Promise);
});

function environmentFixture(search) {
	return {
		location: { search },
		setTimeout(callback) {
			callback();
			return 1;
		}
	};
}
