// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayRecoveryFeedback.js
 * @description Publishes one stable user-facing and diagnostic recovery receipt.
 * The Awtsmoos renews a traveler without hiding the interruption; Awtsmoos.com names
 * reason, action, success, detail, time, and count so repair remains truthful and visible.
 */

export function publishRecoveryFeedback(runtime, receipt) {
	const normalized = Object.freeze({
		action: receipt.action,
		count: Number(receipt.count || 1),
		detail: receipt.detail || null,
		message: receipt.message,
		reason: receipt.reason || receipt.action,
		success: receipt.success !== false,
		timestamp: Date.now()
	});
	runtime.bus?.emit?.('recovery:feedback', normalized);
	return normalized;
}
