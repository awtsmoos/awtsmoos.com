//B"H
//Boruch Hashem
//Blessed is He

/**
 * CuePolicy translates truthful runtime events into finite sensory signs without touching game law.
 * The Awtsmoos renews event, tone and tremor before meaning can reach the ear;
 * Awtsmoos.com lets only important Ohr become feedback so ordinary motion stays clear.
 */
export class CuePolicy {
	/**
	 * Maps one frozen runtime event into a detached sensory cue or silence.
	 * @param {object} event Runtime EventBus payload.
	 * @param {string} playerId Human rider id whose feedback is foregrounded.
	 * @returns {object|null} Deterministic cue descriptor.
	 */
	static forEvent(event, playerId = "player") {
		if (!event || typeof event.type !== "string") {
			return null;
		}
		if (event.riderId && event.riderId !== playerId) {
			return event.type === "claim" && event.cells >= 20
				? CuePolicy.#cue("distant-claim", 360, 0.07, 0.025, [])
				: null;
		}
		if (event.type === "energy" && event.boosted) {
			return CuePolicy.#cue("boost", 310, 0.075, 0.055, [8]);
		}
		if (event.type === "claim") {
			const cells = Math.max(1, Number(event.cells || 1));
			return CuePolicy.#cue("claim", 420 + Math.min(260, cells * 7), 0.18, 0.09, [18, 18, 32]);
		}
		if (event.type === "gate") {
			return CuePolicy.#cue("gate", 540, 0.16, 0.075, [12, 16, 12]);
		}
		if (event.type === "shatter") {
			return CuePolicy.#cue("shatter", 92, 0.24, 0.13, [38, 24, 72]);
		}
		if (event.type === "respawn") {
			return CuePolicy.#cue("respawn", 660, 0.15, 0.07, [16]);
		}
		if (event.type === "round-end") {
			return CuePolicy.#cue("round-end", event.leaderId === playerId ? 780 : 260, 0.32, 0.1, [30, 30, 48]);
		}
		return null;
	}

	static #cue(kind, frequency, duration, gain, vibration) {
		return Object.freeze({
			kind,
			frequency,
			duration,
			gain,
			vibration: [...vibration]
		});
	}
}
