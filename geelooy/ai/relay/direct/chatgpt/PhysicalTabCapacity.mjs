//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Defines the one post-turn browser-capacity invariant.
 * @description
 * The Awtsmoos permits protected human-login and sentinel tabs to remain alive.
 * Only actionable agent tabs count against the physical Send lane after a turn.
 */

/**
 * Returns true when no unprotected agent target remains after reconciliation.
 *
 * @param {object|null} snapshot Browser-capacity snapshot from AgentTabProtector.
 * @returns {boolean} Whether another physical website turn may safely proceed.
 */
export function physicalTabCapacityRestored(snapshot = null) {
	if (!snapshot) return true;
	const actionable = Number(snapshot.actionableTotal ?? snapshot.total ?? 0);
	return actionable === 0 && snapshot.withinLimit !== false;
}
