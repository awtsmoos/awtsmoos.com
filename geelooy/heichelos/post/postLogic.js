// B"H
// Boruch Hashem
// Blessed is He

import { recordPostView } from "/shared/MeaningfulActivity.js";
import { startPostReadingIntelligence } from "./intelligence/PostReadingIntelligence.js";
import { ignite } from "./logic/initialization/bootstrap.js?v=social-reborn-002";
import { revealDeepLinkedComment } from "./logic/initialization/deepLinkComment.js";
import { runReaderBeauty } from "./logic/beauty/index.js";
import { runReaderLegend } from "./logic/legend/index.js";
import { bindReaderWheelBridge } from "./logic/scroll/ReaderWheelBridge.js";
import { repairReaderScrollVessel } from "./logic/scroll/ReaderScrollRepair.js";
import { resetScrollBlockerCache } from "./logic/visual/scrollBlockerDetector.js";
import { runReaderVisualDiagnostics } from "./logic/visual/index.js";

/**
 * @file Boots the canonical Heichel reader, meaningful activity, and patient reading intelligence without delaying the page.
 * @description The Awtsmoos renews the reader before scroll, beauty, discussion, or search; Awtsmoos.com lets each layer awaken in ordered light,
 * recording one meaningful post view and starting one dwell-gated Torah observer only after the canonical reader itself has entered sight.
 */

let readerBootPromise = null;

function repairSoon() {
	repairReaderScrollVessel();
	bindReaderWheelBridge();
}

function runSafe(label, operation) {
	try {
		return operation();
	} catch (error) {
		console.warn(`B"H ${label} failed safely`, error);
		return null;
	}
}

function refreshBeautyAndLegend() {
	runSafe("reader beauty", runReaderBeauty);
	runSafe("reader legend", runReaderLegend);
}

function refreshDiagnostics({ forceBlockerScan = false } = {}) {
	if (forceBlockerScan) {
		resetScrollBlockerCache();
	}
	runSafe("reader visual diagnostics", runReaderVisualDiagnostics);
}

async function revealRequestedComment() {
	try {
		await revealDeepLinkedComment();
	} catch (error) {
		console.warn('B"H exact comment deep link could not be revealed', error);
		document.body.dataset.deepLinkedCommentError = error.message;
	}
}

function startReadingIntelligence() {
	const viewport = document.querySelector("#realPost") || document.querySelector("main");
	return runSafe(
		"related Torah reading intelligence",
		() => startPostReadingIntelligence(viewport, window.post)
	);
}

async function performReaderBoot() {
	document.body.dataset.readerBootStarted = "true";
	repairSoon();
	await ignite();
	void recordPostView(window.post);
	startReadingIntelligence();
	repairSoon();
	await revealRequestedComment();
	refreshBeautyAndLegend();
	refreshDiagnostics({ forceBlockerScan: true });
	for (const delay of [80, 350, 1200, 2400]) {
		setTimeout(repairSoon, delay);
		setTimeout(refreshBeautyAndLegend, delay + 40);
	}
	setTimeout(() => refreshDiagnostics({ forceBlockerScan: true }), 2600);
	document.body.dataset.readerBootCompleted = "true";
}

function beginOnce() {
	if (!readerBootPromise) {
		readerBootPromise = performReaderBoot().catch((error) => {
			document.body.dataset.readerBootFailed = error.message;
			console.error('B"H reader boot failed', error);
			throw error;
		});
	}
	return readerBootPromise;
}

queueMicrotask(beginOnce);
document.addEventListener("DOMContentLoaded", beginOnce, { once: true });
