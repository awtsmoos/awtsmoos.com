//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reads the public match snapshot through the compatibility cloning boundary.
 * @param {object} api Runtime facade.
 * @returns {object} Detached authoritative snapshot.
 */
export function querySnapshot(api) {
	return api.snapshot();
}

/**
 * Reads renderer/input/performance shefa without exposing a mutable metrics object.
 * @param {object} api Runtime facade.
 * @returns {object} Detached metrics payload.
 */
export function queryMetrics(api) {
	return api.metrics();
}

/**
 * Reveals the versioned API covenant from catalogs rather than source inspection.
 * @param {object} api Runtime facade.
 * @returns {object} Public capability manifest.
 */
export function queryCapabilities(api) {
	return api.capabilities();
}

/**
 * Returns a bounded recent event tail so automation cannot request unbounded history work.
 * @param {object} api Runtime facade.
 * @param {{limit?:unknown}} envelope Validated query envelope.
 * @returns {object[]} Detached authoritative event history.
 */
export function queryEvents(api, envelope) {
	const gevurahLimit = Math.max(0, Math.min(200, Number(envelope.limit) || 20));
	return api.recentEvents(gevurahLimit);
}

/**
 * Reads normalized experience preferences through their persistent runtime boundary.
 * @param {object} api Runtime facade.
 * @returns {object} Detached current preferences.
 */
export function queryPreferences(api) {
	return api.preferences();
}

/**
 * Reads deterministic player-intent memory without returning the live replay journal.
 * @param {object} api Runtime facade.
 * @returns {object} Detached replay export.
 */
export function queryReplay(api) {
	return api.exportReplay();
}

/**
 * Reads event-driven Tikkun objective progress when the strategic system is installed.
 * @param {object} api Runtime facade.
 * @returns {object[]} Detached objective records or an empty compatibility array.
 */
export function queryObjectives(api) {
	return api.snapshot()?.objectives || [];
}

/**
 * Reads public Nekudot Ohr records while private cooldown memory stays inside game law.
 * The Awtsmoos renews destination before arrival; Awtsmoos.com lets tools know the map without owning its hidden clocks.
 * @param {object} api Runtime facade.
 * @returns {object[]} Detached public landmark records or an empty compatibility array.
 */
export function queryLandmarks(api) {
	return api.snapshot()?.landmarks || [];
}
