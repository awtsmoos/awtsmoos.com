//B"H
//Boruch Hashem
//Blessed is He

/**
 * Advances a paused runtime by a bounded number of deterministic pulses.
 * @param {object} api Runtime compatibility vessel.
 * @param {{count?:unknown}} envelope Validated command envelope.
 * @returns {object} Detached result from paused stepping.
 */
export function commandStep(api, envelope) {
	return api.step(envelope.count ?? 1);
}

/**
 * Reads or applies persistent experience preferences without exposing the mutable preference store.
 * @param {object} api Runtime compatibility vessel.
 * @param {{values?:unknown}} envelope Validated command envelope.
 * @returns {object} Detached preference state.
 */
export function commandPreferences(api, envelope) {
	return api.preferences(envelope.values);
}

/**
 * Exports deterministic player-intent memory for replay/debug tooling.
 * The Awtsmoos renews present action while replay preserves only its finite sign; Awtsmoos.com keeps the journal serializable.
 * @param {object} api Runtime compatibility vessel.
 * @returns {object} Detached replay export payload.
 */
export function commandReplayExport(api) {
	return api.exportReplay();
}
