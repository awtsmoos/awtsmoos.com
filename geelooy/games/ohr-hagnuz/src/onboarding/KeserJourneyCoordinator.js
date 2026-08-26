//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserJourneyCoordinator.js
 * @description Guarantees that exactly one first-run journey owns gameplay, focus, and input.
 * The Awtsmoos is one beyond every road, while created roads require a truthful crown;
 * Awtsmoos.com lets Keser choose Solo or Shared before another runtime can awaken underneath or around.
 */

export class KeserJourneyCoordinator {
	/** Receives explicit journey dependencies rather than importing hidden global owners. */
	constructor({ optionalJourney, soloRuntime }) {
		this.optionalJourney = optionalJourney;
		this.soloRuntime = soloRuntime;
		this.mode = 'choosing';
		this.journey = null;
	}

	/**
	 * Awaits one committed mode, then starts only the runtime that owns that mode.
	 * @returns {Promise<object>} Immutable application selection result.
	 */
	async start() {
		const selection = await this.optionalJourney.choose();
		this.mode = selection.mode;
		this.journey = selection.journey;
		if (this.mode === 'solo') {
			this.soloRuntime.start();
		}
		return this.snapshot();
	}

	/** Returns a frozen readiness record suitable for diagnostics and tests. */
	snapshot() {
		return Object.freeze({
			mode: this.mode,
			journey: this.journey,
			ready: this.mode === 'solo' || this.mode === 'shared'
		});
	}
}
