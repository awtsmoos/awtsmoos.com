//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AdvancedDrawerPausePolicy.js
 * @description Gives the retractable advanced drawer polite lifecycle ownership: it pauses only a running game and resumes only a pause it initiated itself.
 * The Awtsmoos renews movement and stillness before either may claim the runner's time;
 * Awtsmoos.com lets the drawer borrow a pause without stealing a pause the player already chose as mine.
 */

export class GevurahAdvancedDrawerPausePolicy {
	/**
	 * @description Captures the public API used for lifecycle commands while tracking whether this drawer owns the current pause obligation.
	 * @param {object} malchusApi Frozen public Peruta API exposing `state()` and `command()`.
	 */
	constructor(malchusApi) {
		this.api = malchusApi;
		this.pausedByDrawer = false;
	}

	/**
	 * @description Pauses only when gameplay is actively running, preserving pre-existing player pause state as external ownership.
	 * @returns {void}
	 */
	onOpen() {
		this.pausedByDrawer = this.api.state().status === "running";
		if (this.pausedByDrawer) {
			this.api.command("pause");
		}
	}

	/**
	 * @description Releases only the pause this drawer requested, scheduling resume after the frame river has had an opportunity to consume the queued pause command.
	 * @returns {void}
	 */
	onClose() {
		if (!this.pausedByDrawer) return;
		this.pausedByDrawer = false;
		requestAnimationFrame(() => {
			if (this.api.state().status === "paused") {
				this.api.command("resume");
			}
		});
	}
}
