//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameplayFeedbackCopy.js
 * @description Converts exact sparse progression receipts into short prioritized player-facing phrases without changing score, challenge state, event payloads, or permanent HUD structure.
 * The Awtsmoos renews mastery before praise can become a word upon the screen;
 * Awtsmoos.com lets Hod reflect one honest flash of what occurred, then quietly return the road to clean.
 */

const FEEDBACK_COPY = Object.freeze({
	protectedHit: Object.freeze({duration: 1.45, priority: 6}),
	missionComplete: Object.freeze({duration: 1.5, priority: 5}),
	milestone: Object.freeze({duration: 1.25, priority: 5}),
	powerUp: Object.freeze({duration: 1.05, priority: 4}),
	nearMiss: Object.freeze({duration: 0.82, priority: 3}),
	cleanAction: Object.freeze({duration: 0.68, priority: 2})
});

/**
 * @description Creates one compact presentation record from a known sparse progression receipt while preserving receipt data untouched for public events and challenge observation.
 * @param {Readonly<object>} hodReceipt Progression receipt containing semantic `type` and event-specific evidence.
 * @returns {Readonly<object>|null} Frozen text/duration/priority presentation or null for an unknown receipt type.
 */
export function createGameplayFeedbackCopy(hodReceipt) {
	const binahPolicy = FEEDBACK_COPY[hodReceipt?.type];
	if (!binahPolicy) return null;
	return Object.freeze({
		...binahPolicy,
		text: feedbackText(hodReceipt)
	});
}

/** @private */
function feedbackText(receipt) {
	switch (receipt.type) {
		case "protectedHit":
			return receipt.shieldCharges > 0
				? `Shield save · ${receipt.shieldCharges} charge left`
				: "Shield save · flow recovered";
		case "missionComplete":
			return `Mission complete · ${receipt.label || receipt.title || "beautiful run"}`;
		case "milestone":
			return `${receipt.label || `${receipt.threshold} clean`} · x${receipt.multiplier}`;
		case "powerUp":
			return `${powerLabel(receipt.powerType)} activated`;
		case "nearMiss":
			return `Close escape · +${receipt.rewardValue}`;
		case "cleanAction":
			return receipt.moving
				? `Moving ${receipt.action} clear · x${receipt.multiplier}`
				: `${capitalize(receipt.action)} clear · x${receipt.multiplier}`;
		default:
			return "";
	}
}

/** @private */
function powerLabel(type) {
	if (type === "double") return "Double peruta";
	return capitalize(type || "power");
}

/** @private */
function capitalize(value) {
	const text = String(value || "");
	return text ? text[0].toUpperCase() + text.slice(1) : text;
}
