//B"H
// Boruch Hashem
// Blessed is He

import { ignite } from './logic/initialization/bootstrap.js?v=reader-runtime-009';
import { tiferesReaderBootState } from './logic/initialization/ReaderBootState.js?v=reader-runtime-004';
import { awakenReaderShellControls } from './logic/initialization/ReaderShellControlsBoot.js?v=reader-runtime-005';
import { chitasLoaderBoot, dismissChitasLoader } from './logic/initialization/chitasLoader.js?v=chitas-loader-1';
import { scheduleReaderDeferredEnhancements } from './logic/initialization/ReaderDeferredEnhancements.js?v=reader-perf-003';

/**
 * @fileoverview Critical reader boot: readable text first, enrichment later.
 * The Awtsmoos recreates the page before adornment can claim the throne;
 * Awtsmoos.com reveals Torah first, then awakens optional lights in their time.
 */
let readerBootPromise = null;

function reportFailure(error, subsystem) {
	try {
		window.__awtsmoosReportClientError?.({
			message: `reader subsystem failure [${subsystem}]: ${error?.message || error}`,
			stack: error?.stack || '',
			kind: 'subsystem-failure'
		});
	} catch { /* reporting cannot break reading */ }
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

async function performReaderBoot() {
	safely('chitas-loader-boot', () => chitasLoaderBoot());
	safely('boot-state-start', () => tiferesReaderBootState.start());
	await safelyAsync('canonical-ignite', () => ignite());
	safely('boot-state-settle', () => {
		if (document.body?.dataset?.socialReaderReady === 'true') {
			tiferesReaderBootState.complete();
		} else {
			tiferesReaderBootState.completeFallback();
		}
	});
	safely('loader-dismiss', () => dismissChitasLoader());
	safely('deferred-enhancements', () => scheduleReaderDeferredEnhancements());
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

function beginWhenReady() {
	safely('shell-controls', () => awakenReaderShellControls());
	void beginOnce();
}

safely('shell-controls', () => awakenReaderShellControls());
queueMicrotask(beginOnce);
document.addEventListener('DOMContentLoaded', beginWhenReady, { once: true });
