// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPerformanceHydration.js
 * @description Installs the existing heavy monitor only when diagnostics were explicitly requested.
 * The Awtsmoos measures without burdening the unmeasured path; Awtsmoos.com keeps ordinary movement light,
 * while `diagnostics=true` invites frame windows, long-task observers, renderer counters, and the visible proof into sight.
 */

import { runtimeDiagnosticsEnabled } from '../performance/RuntimeDiagnosticsGate.js';

const MONITOR_URL = '../performance/RuntimePerformanceMonitor.js?v=20260907-diagnostics-gate-01';

/** Schedules an optional performance monitor only for an explicit diagnostics session. */
export function scheduleMinimalMeadowPerformanceMonitor(
	runtime,
	environment = globalThis
) {
	if (!runtimeDiagnosticsEnabled(environment)) {
		runtime.performanceMonitor = null;
		runtime.performanceMonitorStage = 'disabled';
		runtime.performanceMonitorPromise = Promise.resolve(null);
		return runtime.performanceMonitorPromise;
	}
	if (runtime.performanceMonitorPromise) return runtime.performanceMonitorPromise;
	runtime.performanceMonitorStage = 'waiting-for-visible-turn';
	runtime.performanceMonitorPromise = afterVisibleTurn(environment)
		.then(async () => {
			runtime.performanceMonitorStage = 'loading-module';
			const module = await import(MONITOR_URL);
			runtime.performanceMonitorStage = 'installing';
			const monitor = module.installRuntimePerformanceMonitor(runtime, {
				PerformanceObserver: environment.PerformanceObserver
			});
			runtime.performanceMonitorStage = 'ready';
			return monitor;
		})
		.catch(error => {
			runtime.performanceMonitorStage = 'degraded';
			runtime.performanceMonitorError = error;
			console.warn('[MitzvahWorld] Diagnostics monitor degraded.', error);
			return null;
		});
	return runtime.performanceMonitorPromise;
}

/** Gives the playable frame one task before optional monitor installation starts. */
function afterVisibleTurn(environment) {
	const schedule = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout?.bind(globalThis);
	return schedule
		? new Promise(resolve => schedule(resolve, 0))
		: Promise.resolve();
}
