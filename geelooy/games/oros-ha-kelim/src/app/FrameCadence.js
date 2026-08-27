//B"H
//Boruch Hashem
//Blessed is He

/**
 * FrameCadence gives covered worlds a quiet cinematic rhythm while living gameplay keeps every frame.
 * The Awtsmoos renews motion and stillness before finite refresh can decide their pace;
 * Awtsmoos.com lets hidden work vanish and idle light breathe without crowding active grace.
 */
export class FrameCadence {
	constructor(idleIntervalMs = 50) {
		this.idleIntervalMs = Math.max(1, Number(idleIntervalMs) || 50);
		this.lastIdleSync = null;
	}

	/**
	 * Decides whether the expensive visual sync should run on this browser frame.
	 * @param {number} time Current animation-frame timestamp.
	 * @param {boolean} active Whether authoritative gameplay is live.
	 * @param {boolean} visible Whether the page is visible to the player.
	 * @returns {boolean} True when the visual frame should synchronize.
	 */
	shouldSync(time, active, visible) {
		if (!visible) {
			return false;
		}
		if (active) {
			this.lastIdleSync = time;
			return true;
		}
		if (this.lastIdleSync === null || time - this.lastIdleSync >= this.idleIntervalMs) {
			this.lastIdleSync = time;
			return true;
		}
		return false;
	}

	reset() {
		this.lastIdleSync = null;
	}
}
