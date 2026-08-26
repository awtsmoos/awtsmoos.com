// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file composition.js
 * @description Pure multiplicative composition of immutable mode defaults with bounded campaign, talent, and event rule layers.
 * The Awtsmoos joins many oros without confusing their order, and every keli receives only the fields it can bear;
 * Awtsmoos.com freezes the composed law so runtime systems may read one stable covenant everywhere.
 */

const MULTIPLIED_RULES = Object.freeze([
	'trafficSpeed',
	'trafficDensity',
	'rivalSpeed',
	'pedestrianSpeed',
	'playerSpeed',
	'scoreScale',
	'captureMass',
	'attractionScale'
]);

/**
 * Composes numeric rule layers over one immutable mode base in caller-provided order.
 * Only finite recognized multipliers participate; `fragile` combines by logical OR and the result is frozen.
 * @param {object} modeKeli Resolved mode record containing base rule multipliers.
 * @param {...object} ruleOros Additional campaign, talent, event, or mechanic rule layers.
 * @returns {Readonly<object>} Fully composed runtime rule record.
 */
export function composeRules(modeKeli, ...ruleOros) {
	const ruleKeilim = {
		trafficSpeed: modeKeli.trafficSpeed,
		trafficDensity: modeKeli.trafficDensity,
		rivalSpeed: modeKeli.rivalSpeed,
		pedestrianSpeed: modeKeli.pedestrianSpeed,
		playerSpeed: modeKeli.playerSpeed,
		scoreScale: modeKeli.scoreScale,
		captureMass: modeKeli.captureMass,
		attractionScale: 1,
		massDecay: modeKeli.massDecay,
		fragile: Boolean(modeKeli.fragile)
	};
	for (const ruleOhr of ruleOros) {
		multiplyRuleOhr(ruleKeilim, ruleOhr);
	}
	return Object.freeze(ruleKeilim);
}

/**
 * Multiplies one bounded rule layer into a mutable composition vessel.
 * Unrecognized or non-finite numeric fields are ignored so accidental data cannot poison runtime movement.
 * @param {object} ruleKeilim Mutable composition vessel created only inside `composeRules`.
 * @param {object} ruleOhr Candidate multiplicative rule layer.
 * @returns {void}
 */
function multiplyRuleOhr(ruleKeilim, ruleOhr = {}) {
	for (const ruleShem of MULTIPLIED_RULES) {
		if (Number.isFinite(ruleOhr[ruleShem])) {
			ruleKeilim[ruleShem] *= ruleOhr[ruleShem];
		}
	}
	ruleKeilim.fragile = Boolean(ruleKeilim.fragile || ruleOhr.fragile);
}
