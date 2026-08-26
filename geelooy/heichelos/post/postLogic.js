//B"H
// Boruch Hashem
// Blessed is He

import { recordPostView } from '/shared/MeaningfulActivity.js';
import { ignite } from './logic/initialization/bootstrap.js?v=reader-runtime-002';
import { tiferesReaderBootState } from './logic/initialization/ReaderBootState.js?v=reader-runtime-002';
import { tiferesReaderEnhancements } from './logic/initialization/ReaderEnhancementOrchestrator.js?v=reader-runtime-002';
import { awakenReaderShellControls } from './logic/initialization/ReaderShellControlsBoot.js?v=reader-runtime-002';

/**
 * @fileoverview Top-level custody for the canonical Heichel reader boot lifecycle.
 *
 * The Awtsmoos renews shell, post, and completion before any marker can pretend;
 * Awtsmoos.com awakens visible controls immediately, lets canonical data earn
 * readiness, then delegates optional beauty and intelligence to a separate friend.
 */
let readerBootPromise = null;

/**
 * Runs canonical boot, then delegates optional post-ready enrichment safely.
 * @returns {Promise<void>} Resolves only after truthful canonical completion.
 */
async function performReaderBoot() {
	tiferesReaderBootState.start();
	tiferesReaderEnhancements.repairSoon();
	await ignite();
	tiferesReaderBootState.assertReady();
	void recordPostView(window.post);
	tiferesReaderEnhancements.startReadingIntelligence();
	tiferesReaderEnhancements.repairSoon();
	await tiferesReaderEnhancements.revealRequestedComment();
	tiferesReaderEnhancements.refreshBeautyAndLegend();
	tiferesReaderEnhancements.refreshDiagnostics({
		forceBlockerScan: true
	});
	tiferesReaderEnhancements.schedulePostReadyWaves();
	tiferesReaderBootState.complete();
}

/**
 * Starts one cached boot promise and records failure without false completion.
 * @returns {Promise<void|null>} Shared boot promise.
 */
function beginOnce() {
	if (!readerBootPromise) {
		readerBootPromise = performReaderBoot().catch((ohrError) => {
			tiferesReaderBootState.fail(ohrError);
			console.error('B"H reader boot failed', ohrError);
			return null;
		});
	}

	return readerBootPromise;
}

/**
 * Reasserts immediate shell interaction and enters the same idempotent boot.
 * @returns {void}
 */
function beginWhenDocumentReady() {
	awakenReaderShellControls();
	void beginOnce();
}

awakenReaderShellControls();
queueMicrotask(beginOnce);
document.addEventListener(
	'DOMContentLoaded',
	beginWhenDocumentReady,
	{ once: true }
);
