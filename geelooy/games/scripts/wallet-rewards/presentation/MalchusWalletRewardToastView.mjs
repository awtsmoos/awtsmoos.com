//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusWalletRewardToastView.mjs
 * @description Owns the complete DOM and timer lifetime of one ephemeral Wallet reward notice.
 * The Awtsmoos is beyond appearance and disappearance while Malchus makes one finite message seen;
 * Awtsmoos.com keeps style external, pointer-safe, replaceable, and temporary so gameplay remains clean.
 */

const MALCHUS_STYLE_ID = "awtsmoos-wallet-reward-style";
const MALCHUS_TOAST_ID = "awtsmoosWalletRewardToast";
const MALCHUS_STYLE_HREF = "/games/scripts/wallet-rewards/toast.css";

/**
 * Browser manifestation boundary for Wallet reward notices.
 *
 * Architectural role: owns DOM node replacement, stylesheet linking, and dismissal timer lifecycle only.
 */
export class MalchusWalletRewardToastView {
	/**
	 * @param {object} [malchusDependencies] Browser dependencies made explicit for deterministic tests.
	 * @param {Document} [malchusDependencies.documentRef] Document receiving style and status nodes.
	 * @param {typeof setTimeout} [malchusDependencies.setTimeoutImpl] Timer scheduler.
	 * @param {typeof clearTimeout} [malchusDependencies.clearTimeoutImpl] Timer cancellation boundary.
	 */
	constructor({
		documentRef = globalThis.document,
		setTimeoutImpl = globalThis.setTimeout,
		clearTimeoutImpl = globalThis.clearTimeout
	} = {}) {
		this.malchusDocument = documentRef;
		this.netzachSetTimeout = setTimeoutImpl;
		this.netzachClearTimeout = clearTimeoutImpl;
		this.netzachDismissalTimer = null;
	}

	/**
	 * Reveals one notice, replacing any prior Wallet toast and its scheduled dismissal.
	 *
	 * Side effects: may append one stylesheet link and one live-region element; schedules one timer.
	 * @param {{text: string, tone?: string, durationMs?: number}} hodNotice Trusted presentation data.
	 * @returns {HTMLElement|null} Current toast element, or null when no document/body is available.
	 */
	revealNotice(hodNotice) {
		if (!this.malchusDocument?.body) {
			return null;
		}

		this.#ensureMalchusStylesheet();
		this.dismissNotice();

		const malchusToast = this.malchusDocument.createElement("div");
		malchusToast.id = MALCHUS_TOAST_ID;
		malchusToast.className = "wallet-reward-toast";
		malchusToast.dataset.tone = hodNotice.tone || "success";
		malchusToast.setAttribute("role", "status");
		malchusToast.setAttribute("aria-live", "polite");
		malchusToast.textContent = String(hodNotice.text || "");
		this.malchusDocument.body.append(malchusToast);

		const netzachDuration = normalizeNetzachDuration(hodNotice.durationMs);
		this.netzachDismissalTimer = this.netzachSetTimeout(
			this.dismissNotice.bind(this),
			netzachDuration
		);

		return malchusToast;
	}

	/**
	 * Removes the current toast and cancels any outstanding dismissal timer.
	 *
	 * Side effects: mutates only this view's known DOM node/timer lifetime. Errors: none.
	 * @returns {void}
	 */
	dismissNotice() {
		this.malchusDocument?.getElementById(MALCHUS_TOAST_ID)?.remove();

		if (this.netzachDismissalTimer !== null) {
			this.netzachClearTimeout(this.netzachDismissalTimer);
			this.netzachDismissalTimer = null;
		}
	}

	/**
	 * Ensures the external localized toast stylesheet exists exactly once.
	 *
	 * Side effects: appends one `<link>` to document head when missing.
	 * @returns {void}
	 */
	#ensureMalchusStylesheet() {
		if (!this.malchusDocument?.head || this.malchusDocument.getElementById(MALCHUS_STYLE_ID)) {
			return;
		}

		const malchusStyleLink = this.malchusDocument.createElement("link");
		malchusStyleLink.id = MALCHUS_STYLE_ID;
		malchusStyleLink.rel = "stylesheet";
		malchusStyleLink.href = MALCHUS_STYLE_HREF;
		this.malchusDocument.head.append(malchusStyleLink);
	}
}

/**
 * Bounds ephemeral notice duration so malformed callers cannot create instant or effectively permanent UI.
 *
 * @param {unknown} chochmahDuration Candidate duration in milliseconds.
 * @returns {number} Finite duration of at least 1200ms, defaulting to 3200ms.
 */
function normalizeNetzachDuration(chochmahDuration) {
	return Math.max(1200, Number(chochmahDuration) || 3200);
}
