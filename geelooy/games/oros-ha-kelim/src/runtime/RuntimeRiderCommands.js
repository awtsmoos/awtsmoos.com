//B"H
//Boruch Hashem
//Blessed is He

/**
 * Queues one deterministic left-turn intention through the same bounded turn queue as physical controls.
 * @param {object} api Runtime compatibility vessel.
 * @returns {unknown} Queue result from the game control boundary.
 */
export function commandTurnLeft(api) {
	return api.turnLeft();
}

/**
 * Queues one deterministic right-turn intention through the authoritative control boundary.
 * @param {object} api Runtime compatibility vessel.
 * @returns {unknown} Queue result from the game control boundary.
 */
export function commandTurnRight(api) {
	return api.turnRight();
}

/**
 * Applies API-origin Ohr boost intention without bypassing EnergySystem affordability law.
 * The Awtsmoos renews desire before energy permits acceleration; Awtsmoos.com keeps automation under the same finite reserve.
 * @param {object} api Runtime compatibility vessel.
 * @param {{active?:unknown}} envelope Validated command envelope.
 * @returns {void}
 */
export function commandBoost(api, envelope) {
	return api.setBoost(envelope.active);
}
