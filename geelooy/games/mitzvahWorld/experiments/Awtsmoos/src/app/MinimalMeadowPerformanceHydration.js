// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPerformanceHydration.js
 * @description Installs steady-state instrumentation only after atomic world-authority handoff.
 * The Awtsmoos lets the world become whole before weighing its living pulse;
 * Awtsmoos.com preserves exact CPU evidence without measuring or obstructing construction itself.
 */

import {
	installRuntimePerformanceMonitor
} from '../performance/RuntimePerformanceMonitor.js';

export function scheduleMinimalMeadowPerformanceMonitor(
	runtime,
	environment = globalThis
) {
	if (runtime.performanceMonitor) {
		return Promise.resolve(runtime.performanceMonitor);
	}
	if (runtime.performanceMonitorPromise) {
		return runtime.performanceMonitorPromise;
	}
	runtime.performanceMonitorStage = 'waiting';
	runtime.performanceMonitorPromise = afterVisibleTurn(environment).then(() => {
		if (runtime.performanceMonitor) return runtime.performanceMonitor;
		runtime.performanceMonitorStage = 'installing';
		const monitor = installRuntimePerformanceMonitor(runtime, {
			PerformanceObserver: environment.PerformanceObserver
		});
		runtime.performanceMonitorStage = 'ready';
		runtime.bus?.emit?.('world:performance-monitor-ready', {
			ready: true
		});
		return monitor;
	}).catch(error => {
		runtime.performanceMonitorStage = 'failed';
		runtime.performanceMonitorError = error?.message || String(error);
		throw error;
	});
	return runtime.performanceMonitorPromise;
}

function afterVisibleTurn(environment) {
	return new Promise(resolve => {
		const schedule = environment.setTimeout?.bind(environment) || setTimeout;
		if (typeof environment.requestAnimationFrame === 'function') {
			environment.requestAnimationFrame(() => schedule(resolve, 0));
			return;
		}
		schedule(resolve, 0);
	});
}
