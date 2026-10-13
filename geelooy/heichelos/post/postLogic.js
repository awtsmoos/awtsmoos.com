// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Top-level custody for the canonical Heichel reader boot lifecycle.
 *
 * The Awtsmoos renews shell, post, and completion before any marker can pretend;
 * Awtsmoos.com awakens canonical truth from the fifth boot while the sixth runtime carries bounded enhancement as a separate friend.
 *
 * B"H — standing law: no single JS failure may ever blank the reader. Every
 * subsystem boots inside its own try/catch; a dead typography button, a broken
 * connections panel, or a failed intelligence stream can never take down the
 * article. ignite() itself never throws — it falls back to plain bilingual
 * text on any exception.
 */

import { recordPostView } from '/shared/MeaningfulActivity.js';
import { ignite } from './logic/initialization/bootstrap.js?v=reader-runtime-009';
import { tiferesReaderBootState } from './logic/initialization/ReaderBootState.js?v=reader-runtime-004';
import { tiferesReaderEnhancements } from './logic/initialization/ReaderEnhancementOrchestrator.js?v=reader-runtime-008';
import { awakenReaderShellControls } from './logic/initialization/ReaderShellControlsBoot.js?v=reader-runtime-005';
import { chitasLoaderBoot, dismissChitasLoader } from './logic/initialization/chitasLoader.js?v=chitas-loader-1';

let readerBootPromise = null;

/**
 * Reports a subsystem failure through the inline client error reporter.
 * Never throws.
 * @param {unknown} ohrError Failure value.
 * @param {string} ohrSubsystem Subsystem label.
 * @returns {void}
 */
function reportSubsystemFailure(ohrError, ohrSubsystem) {
	try {
		const reporter = typeof window !== 'undefined' && window.__awtsmoosReportClientError;
		if (typeof reporter === 'function') {
			const err = ohrError instanceof Error ? ohrError : new Error(String(ohrError));
			reporter({
				message: 'reader subsystem failure [' + ohrSubsystem + ']: ' + err.message,
				file: '',
				line: 0,
				col: 0,
				stack: err.stack || '',
				kind: 'subsystem-failure'
			});
		}
	} catch (reportError) {
		// Reporting must never break boot.
	}
	console.warn('B"H reader subsystem failed safely [' + ohrSubsystem + ']', ohrError);
}

/**
 * Runs one synchronous subsystem step; a throw becomes a report, never a crash.
 * @param {string} ohrSubsystem Subsystem label.
 * @param {Function} ohrStep Step function.
 * @returns {unknown} Step result or null.
 */
function safeSubsystem(ohrSubsystem, ohrStep) {
	try {
		return ohrStep();
	} catch (ohrError) {
		reportSubsystemFailure(ohrError, ohrSubsystem);
		return null;
	}
}

/**
 * Runs one async subsystem step; a rejection becomes a report, never a crash.
 * @param {string} ohrSubsystem Subsystem label.
 * @param {Function} ohrStep Async step function.
 * @returns {Promise<unknown>} Step result or null.
 */
async function safeSubsystemAsync(ohrSubsystem, ohrStep) {
	try {
		return await ohrStep();
	} catch (ohrError) {
		reportSubsystemFailure(ohrError, ohrSubsystem);
		return null;
	}
}

/**
 * Awakens shell controls without ever letting their failure kill the module.
 * @returns {void}
 */
function awakenShellControlsSafely() {
	safeSubsystem('shell-controls', () => awakenReaderShellControls());
}

/**
 * Runs canonical boot, then delegates optional post-ready enrichment safely.
 * No step here can throw: each is contained, and ignite() itself falls back
 * to plain bilingual text rather than rejecting.
 * @returns {Promise<void>} Resolves after boot or safe degradation.
 */
async function performReaderBoot() {
	// B"H — beautiful Chitas loader overlay boots first; it fades once the
	// reader is ready (or via CSS fallback if JS dies — never traps content).
	safeSubsystem('chitas-loader-boot', () => chitasLoaderBoot());
	safeSubsystem('boot-state-start', () => tiferesReaderBootState.start());
	safeSubsystem('enhancement-repair-soon', () => tiferesReaderEnhancements.repairSoon());
	// B"H — ignite() never throws by construction (plain bilingual fallback
	// on any exception), but contain it anyway: defense in depth.
	await safeSubsystemAsync('canonical-ignite', () => ignite());
	safeSubsystem('boot-state-settle', () => {
		const dataset = (typeof document !== 'undefined' && document.body && document.body.dataset) || {};
		if (dataset.socialReaderReady === 'true') {
			tiferesReaderBootState.complete();
		} else {
			// Honest fallback evidence: never claim canonical readiness.
			tiferesReaderBootState.completeFallback();
		}
	});
	safeSubsystem('record-post-view', () => recordPostView(typeof window !== 'undefined' ? window.post : null));
	safeSubsystem('reading-intelligence', () => tiferesReaderEnhancements.startReadingIntelligence());
	safeSubsystem('connections', () => tiferesReaderEnhancements.startConnections());
	safeSubsystem('enhancement-repair-soon-2', () => tiferesReaderEnhancements.repairSoon());
	await safeSubsystemAsync('deep-linked-comment', () => tiferesReaderEnhancements.revealRequestedComment());
	safeSubsystem('beauty-and-legend', () => tiferesReaderEnhancements.refreshBeautyAndLegend());
	safeSubsystem('diagnostics', () => tiferesReaderEnhancements.refreshDiagnostics({
		forceBlockerScan: true
	}));
	safeSubsystem('post-ready-waves', () => tiferesReaderEnhancements.schedulePostReadyWaves());
	// B"H — reader is ready: fade the beautiful loader to reveal content.
	safeSubsystem('chitas-loader-dismiss', () => dismissChitasLoader());
}

/**
 * Starts one cached boot promise and records failure without false completion.
 * @returns {Promise<void|null>} Shared boot promise.
 */
function beginOnce() {
	if (!readerBootPromise) {
		readerBootPromise = performReaderBoot().catch((ohrError) => {
			// B"H — backstop only; performReaderBoot contains every step.
			safeSubsystem('boot-backstop', () => tiferesReaderBootState.fail(ohrError));
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
	awakenShellControlsSafely();
	void beginOnce();
}

awakenShellControlsSafely();
queueMicrotask(beginOnce);
document.addEventListener(
	'DOMContentLoaded',
	beginWhenDocumentReady,
	{ once: true }
);
