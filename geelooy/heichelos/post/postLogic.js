//B"H
// Boruch Hashem
// Blessed is He

import { ignite } from './logic/initialization/bootstrap.js?v=reader-runtime-010';
import { tiferesReaderBootState } from './logic/initialization/ReaderBootState.js?v=reader-runtime-004';
import { armReaderFeatureStyles } from './logic/initialization/ReaderFeatureStyles.js?v=reader-features-002';
import { awakenReaderShellControls } from './logic/initialization/ReaderShellControlsBoot.js?v=reader-runtime-005';
import { scheduleReaderDeferredEnhancements } from './logic/initialization/ReaderDeferredEnhancements.js?v=reader-perf-003';

/**
 * @fileoverview Enhances Torah that already exists visibly in the first response.
 * The Awtsmoos reveals the letters before machinery begins its race;
 * Awtsmoos.com lets hidden chambers load only when their worlds need place.
 */
let readerBootPromise = null;

function reportFailure(error, subsystem) {
	try {
		window.__awtsmoosReportClientError?.({
			message: `reader subsystem failure [${subsystem}]: ${error?.message || error}`,
			stack: error?.stack || '',
			kind: 'subsystem-failure'
		});
	} catch {
		/* Reporting must never interrupt readable Torah. */
	}
	console.warn(`B"H reader subsystem failed safely [${subsystem}]`, error);
}

function safely(subsystem, task) {
	try {
		return task();
	} catch (error) {
		reportFailure(error, subsystem);
		return null;
	}
}

async function safelyAsync(subsystem, task) {
	try {
		return await task();
	} catch (error) {
		reportFailure(error, subsystem);
		return null;
	}
}

function scheduleIdleInfrastructure() {
	const awaken = () => {
		void import('./logic/initialization/ReaderClientErrorReporter.js?v=reader-instant-001');
		void import('./logic/initialization/ReaderServiceWorkerBoot.js?v=reader-instant-001');
	};
	const schedule = () => {
		if (globalThis.requestIdleCallback) {
			globalThis.requestIdleCallback(awaken, { timeout: 4000 });
			return;
		}
		setTimeout(awaken, 1200);
	};
	if (document.readyState === 'complete') {
		schedule();
		return;
	}
	window.addEventListener('load', schedule, { once: true });
}

async function performReaderBoot() {
	safely('boot-state-start', () => tiferesReaderBootState.start());
	await safelyAsync('canonical-ignite', () => ignite());
	safely('boot-state-settle', () => {
		if (document.body?.dataset?.socialReaderReady === 'true') {
			tiferesReaderBootState.complete();
			return;
		}
		tiferesReaderBootState.completeFallback();
	});
	safely('deferred-enhancements', () => scheduleReaderDeferredEnhancements());
	safely('idle-infrastructure', () => scheduleIdleInfrastructure());
}

function beginOnce() {
	if (!readerBootPromise) {
		readerBootPromise = performReaderBoot().catch((error) => {
			safely('boot-backstop', () => tiferesReaderBootState.fail(error));
			return null;
		});
	}
	return readerBootPromise;
}

safely('feature-styles', () => armReaderFeatureStyles());
safely('shell-controls', () => awakenReaderShellControls());
queueMicrotask(() => void beginOnce());
