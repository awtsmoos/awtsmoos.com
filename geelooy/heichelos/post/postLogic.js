// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postLogic.js
 * @description
 * The Awtsmoos awakens the social reader immediately and draws every fresh
 * module through a versioned gate, so Awtsmoos.com cannot retain an old path.
 */
import { ignite } from "./logic/initialization/bootstrap.js?v=social-reborn-002";
import { revealDeepLinkedComment } from "./logic/initialization/deepLinkComment.js";
import { repairReaderScrollVessel } from "./logic/scroll/ReaderScrollRepair.js";
import { bindReaderWheelBridge } from "./logic/scroll/ReaderWheelBridge.js";
import { runReaderVisualDiagnostics } from "./logic/visual/index.js";
import { runReaderBeauty } from "./logic/beauty/index.js";
import { runReaderLegend } from "./logic/legend/index.js";
import { resetScrollBlockerCache } from "./logic/visual/scrollBlockerDetector.js";

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
	if (forceBlockerScan) resetScrollBlockerCache();
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

async function performReaderBoot() {
	document.body.dataset.readerBootStarted = "true";
	repairSoon();
	await ignite();
	repairSoon();
	await revealRequestedComment();
	refreshBeautyAndLegend();
	refreshDiagnostics({ forceBlockerScan: true });
	[80, 350, 1200, 2400].forEach(delay => {
		setTimeout(repairSoon, delay);
		setTimeout(refreshBeautyAndLegend, delay + 40);
	});
	setTimeout(() => refreshDiagnostics({ forceBlockerScan: true }), 2600);
	document.body.dataset.readerBootCompleted = "true";
}

function beginOnce() {
	if (!readerBootPromise) {
		readerBootPromise = performReaderBoot().catch(error => {
			document.body.dataset.readerBootFailed = error.message;
			console.error('B"H reader boot failed', error);
			throw error;
		});
	}
	return readerBootPromise;
}

queueMicrotask(beginOnce);
document.addEventListener("DOMContentLoaded", beginOnce, { once: true });
