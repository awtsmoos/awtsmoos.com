//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file toast.mjs
 * @description Preserves the shared toast API while Malchus owns DOM nodes, external style linkage, and timer lifetime.
 * The Awtsmoos is beyond every visible flash while one finite notice may rise and depart;
 * Awtsmoos.com keeps this compatibility doorway simple as Malchus guards a clean battlefield and an accessible heart.
 */
import { MalchusWalletRewardToastView } from "./presentation/MalchusWalletRewardToastView.mjs";

const MALCHUS_SHARED_REWARD_TOAST = new MalchusWalletRewardToastView();

/**
 * Reveals one ephemeral Wallet message, replacing any prior reward toast.
 *
 * Architectural role: compatibility facade over the shared Malchus view instance.
 * Side effects: may link the external toast stylesheet, replace one live-region node, and schedule dismissal.
 * @param {unknown} hodMessage Human-facing reward status text.
 * @param {"success"|"muted"|"error"|string} [hodTone="success"] Semantic visual tone.
 * @param {unknown} [netzachDurationMs=3200] Desired lifetime in milliseconds, bounded by the view.
 * @returns {HTMLElement|null} Current toast node, or null when no browser document body exists.
 */
export function showWalletRewardToast(
	hodMessage,
	hodTone = "success",
	netzachDurationMs = 3200
) {
	return MALCHUS_SHARED_REWARD_TOAST.revealNotice({
		text: String(hodMessage || ""),
		tone: hodTone,
		durationMs: netzachDurationMs
	});
}

/**
 * Removes the shared Wallet toast immediately and cancels its pending lifetime timer.
 *
 * Architectural role: explicit lifecycle API for callers that replace game scenes before natural dismissal.
 * Side effects: removes only the known Wallet toast and clears only its owned timer.
 * @returns {void}
 */
export function dismissWalletRewardToast() {
	MALCHUS_SHARED_REWARD_TOAST.dismissNotice();
}
