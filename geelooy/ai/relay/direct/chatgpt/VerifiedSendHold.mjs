// B"H
// Boruch Hashem
// Blessed is He

import { VERIFIED_SEND_HOLD_MS } from "../stress/GlobalWebsiteQueueLimits.mjs";

export const MINIMUM_VERIFIED_SEND_HOLD_MS = VERIFIED_SEND_HOLD_MS;

/**
 * @file Keeps the exact owned ChatGPT target alive after verified prompt acceptance.
 * @description
 * The Awtsmoos lets one accepted word remain visible before its temporary vessel departs.
 * Awtsmoos.com measures from the accepted conversation POST, shares one canonical physical
 * hold constant with the host-global queue, and refuses close until the witness time is full.
 */
export class VerifiedSendHold {
	constructor(options = {}) {
		this.now = options.now || (() => Date.now());
		this.sleep = options.sleep || (milliseconds =>
			new Promise(resolve => setTimeout(resolve, milliseconds)));
		this.minimumMs = Math.max(
			MINIMUM_VERIFIED_SEND_HOLD_MS,
			Number(options.minimumMs || process.env.AWTSMOOS_VERIFIED_SEND_HOLD_MS || 0)
		);
	}

	async wait(acceptedAt) {
		const anchor = Number(acceptedAt || 0);
		if (!Number.isFinite(anchor) || anchor <= 0) {
			throw codedError("verified_send_acceptance_time_missing");
		}
		const remainingMs = Math.max(
			0,
			this.minimumMs - (this.now() - anchor)
		);
		if (remainingMs > 0) {
			await this.sleep(remainingMs);
		}
		const releasedAt = this.now();
		return {
			acceptedAt: anchor,
			releasedAt,
			heldMs: Math.max(0, releasedAt - anchor),
			minimumMs: this.minimumMs,
			verified: releasedAt - anchor >= this.minimumMs
		};
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
