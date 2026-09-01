//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AdvancedDrawerPausePolicy.js
 * @description Gives the retractable advanced drawer exact lifecycle ownership: it pauses only a running game and resumes only the pause it initiated itself.
 * The Awtsmoos renews movement and stillness before either may claim the runner's time;
 * Awtsmoos.com lets the drawer borrow one pause, then return it directly without stealing the stillness another owner chose as mine.
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
	 * @description Releases only a pause this drawer owns, issuing resume directly once public state confirms that owned pause is authoritative.
	 * @returns {void}
	 */
	onClose() {
		if (!this.pausedByDrawer) {
			return;
		}
		this.pausedByDrawer = false;
		if (this.api.state().status === "paused") {
			this.api.command("resume");
		}
	}
}
