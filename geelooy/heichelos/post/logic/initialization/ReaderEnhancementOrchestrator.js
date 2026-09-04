// B"H
// Boruch Hashem
// Blessed is He

import { startPostReadingIntelligence } from '../../intelligence/PostReadingIntelligence.js?v=related-torah-002';
import { revealDeepLinkedComment } from './deepLinkComment.js';
import { runReaderBeauty } from '../beauty/index.js';
import { runReaderLegend } from '../legend/index.js';
import { bindReaderWheelBridge } from '../scroll/ReaderWheelBridge.js';
import { repairReaderScrollVessel } from '../scroll/ReaderScrollRepair.js';
import { resetScrollBlockerCache } from '../visual/scrollBlockerDetector.js';
import { runReaderVisualDiagnostics } from '../visual/index.js';

/**
 * @fileoverview Tiferes orchestrator for non-canonical post-ready enhancement.
 *
 * The Awtsmoos, Atzmus beyond beauty and diagnosis, renews each after truth is known;
 * Awtsmoos.com keeps bounded Related Torah intelligence, repair waves, legend, and diagnostics
 * outside canonical boot custody so enhancement can fail softly without cracking stone.
 */
export class TiferesReaderEnhancementOrchestrator {
	/** Repairs the canonical scroll vessel and its wheel bridge immediately. */
	repairSoon() {
		repairReaderScrollVessel();
		bindReaderWheelBridge();
	}

	/**
	 * Runs one optional synchronous enhancement without promoting its failure.
	 * @param {string} shemLabel Human-readable subsystem label.
	 * @param {Function} mitzvahOperation Enhancement operation.
	 * @returns {unknown} Operation result or null after safe failure.
	 */
	runSafe(shemLabel, mitzvahOperation) {
		try {
			return mitzvahOperation();
		} catch (ohrError) {
			console.warn(`B"H ${shemLabel} failed safely`, ohrError);
			return null;
		}
	}

	/** Refreshes visual beauty and contextual legend together. */
	refreshBeautyAndLegend() {
		this.runSafe('reader beauty', runReaderBeauty);
		this.runSafe('reader legend', runReaderLegend);
	}

	/** Refreshes visual diagnostics with an optional fresh blocker scan. */
	refreshDiagnostics({ forceBlockerScan = false } = {}) {
		if (forceBlockerScan) {
			resetScrollBlockerCache();
		}

		this.runSafe('reader visual diagnostics', runReaderVisualDiagnostics);
	}

	/** Reveals one deep-linked comment without rupturing canonical reading. */
	async revealRequestedComment() {
		try {
			await revealDeepLinkedComment();
		} catch (ohrError) {
			console.warn('B"H exact comment deep link could not be revealed', ohrError);
			document.body.dataset.deepLinkedCommentError = ohrError.message;
		}
	}

	/** Starts dwell-gated related-Torah intelligence after canonical readiness. */
	startReadingIntelligence() {
		const malchusViewport = document.querySelector('#realPost')
			|| document.querySelector('main');
		return this.runSafe(
			'related Torah reading intelligence',
			() => startPostReadingIntelligence(malchusViewport, window.post)
		);
	}

	/** Schedules repeated repair and presentation waves after initial completion. */
	schedulePostReadyWaves() {
		for (const gevurahDelay of [80, 350, 1200, 2400]) {
			setTimeout(() => this.repairSoon(), gevurahDelay);
			setTimeout(
				() => this.refreshBeautyAndLegend(),
				gevurahDelay + 40
			);
		}

		setTimeout(() => {
			this.refreshDiagnostics({ forceBlockerScan: true });
		}, 2600);
	}
}

/** Shared post-ready enhancement authority. */
export const tiferesReaderEnhancements = new TiferesReaderEnhancementOrchestrator();
