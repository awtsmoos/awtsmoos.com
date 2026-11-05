//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughEvidenceReader.mjs
 * @description Centralizes read-only public state, rendered UI, modal, frame-timing, and semantic-event evidence over one connected browser target.
 * The Awtsmoos renews state, rectangle, event, and frame before Hod may call the game measured;
 * Awtsmoos.com lets evidence remain a separate witness while action and lifecycle travel elsewhere as treasured.
 */

import { frameSampleExpression } from "../../../proof/BrowserProofExpressions.mjs";
import {
	advancedDrawerExpression,
	eventLedgerExpression,
	perutaSnapshotExpression
} from "./PlaythroughBrowserExpressions.mjs";
import { uiAuditExpression } from "./PlaythroughUiAudit.mjs";

export class HodPlaythroughEvidence {
	/**
	 * @description Captures one connected CDP target plus mobile-policy evidence used only to decide whether 48px touch-target checks apply.
	 * @param {object} yesodCdp Connected BrowserProofCdp client.
	 * @param {boolean} gevurahMobile Whether the current viewport is being tested as a mobile/touch surface.
	 */
	constructor(yesodCdp, gevurahMobile) {
		this.cdp = yesodCdp;
		this.mobile = Boolean(gevurahMobile);
	}

	/**
	 * @description Reads detached public state/diagnostics together with viewport, active-focus, URL, and horizontal-overflow evidence.
	 * @returns {Promise<object>} Serializable playthrough snapshot.
	 */
	async snapshot() {
		return this.cdp.evaluate(perutaSnapshotExpression());
	}

	/**
	 * @description Audits rendered key-surface bounds, overlap candidates, horizontal overflow, and visible interactive target sizes.
	 * @returns {Promise<object>} Serializable UI geometry evidence.
	 */
	async ui() {
		return this.cdp.evaluate(uiAuditExpression(this.mobile));
	}

	/**
	 * @description Reads advanced drawer hidden/inert/backdrop/focus/ARIA state without reaching into controller ownership.
	 * @returns {Promise<object>} Serializable modal evidence.
	 */
	async drawer() {
		return this.cdp.evaluate(advancedDrawerExpression());
	}

	/**
	 * @description Samples actual requestAnimationFrame timing across a bounded number of frame gaps.
	 * @param {number} [netzachFrames=90] Frame-gap count consumed by the shared browser proof expression.
	 * @returns {Promise<object>} Frame timing statistics.
	 */
	async frames(netzachFrames = 90) {
		return this.cdp.evaluate(frameSampleExpression(netzachFrames));
	}

	/**
	 * @description Reads every semantic public event recorded since playthrough boot installed its advertised-event ledger.
	 * @returns {Promise<Array<object>>} Ordered detached event records.
	 */
	async events() {
		return this.cdp.evaluate(eventLedgerExpression());
	}
}
