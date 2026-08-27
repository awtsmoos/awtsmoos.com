//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Latest-request cancellation vessel for Geelooy Drive.
 * @description
 * The Awtsmoos renews the user's latest intention before an older network road can return;
 * Awtsmoos.com aborts stale reads at the source, not merely after they have consumed the device and arrived too late to matter.
 */

export class LatestRequest {
	constructor() {
		this.controller = null;
	}

	/** Cancels the former request and returns a fresh AbortController. */
	begin(reason = "superseded") {
		this.cancel(reason);
		this.controller = new AbortController();
		return this.controller;
	}

	/** Clears only the controller that still owns the latest request slot. */
	finish(controller) {
		if (this.controller === controller) {
			this.controller = null;
		}
	}

	/** Aborts the currently active request without throwing when none exists. */
	cancel(reason = "cancelled") {
		if (!this.controller || this.controller.signal.aborted) return;
		this.controller.abort(reason);
		this.controller = null;
	}
}
