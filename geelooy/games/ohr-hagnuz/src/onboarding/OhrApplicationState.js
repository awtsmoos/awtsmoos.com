//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrApplicationState.js
 * @description Owns truthful application readiness separately from Solo HolyEngine ignition.
 * The Awtsmoos renews every state without becoming a state; Awtsmoos.com records only created facts,
 * so diagnostics can distinguish choosing, Solo, Shared, and failure without collapsing unlike acts.
 */

export class OhrApplicationState {
	/** Creates an undecided application covenant with no journey owning input yet. */
	constructor() {
		this.mode = null;
		this.ready = false;
		this.failed = false;
		this.error = null;
		this.publish();
	}

	/** Marks one committed mode ready and publishes compatibility diagnostics. */
	markReady(mode, soloIgnited = false) {
		this.mode = mode;
		this.ready = true;
		this.failed = false;
		this.error = null;
		this.publish(soloIgnited);
	}

	/** Marks application boot failed without pretending any journey owns the page. */
	markFailed(error) {
		this.mode = null;
		this.ready = false;
		this.failed = true;
		this.error = error instanceof Error ? error : new Error(String(error));
		this.publish(false);
	}

	/** Returns a frozen state record suitable for tests, UI, and support diagnostics. */
	snapshot() {
		return Object.freeze({
			mode: this.mode,
			ready: this.ready,
			failed: this.failed,
			error: this.error
		});
	}

	/** Publishes narrow compatibility globals without exposing mutable internal state. */
	publish(soloIgnited = false) {
		globalThis.__OHR_HAGNUZ_MODE__ = this.mode;
		globalThis.__OHR_HAGNUZ_READY__ = this.ready;
		globalThis.__OHR_HAGNUZ_IGNITED__ = Boolean(soloIgnited);
		globalThis.__OHR_HAGNUZ_APP_STATE__ = this.snapshot();
	}
}
