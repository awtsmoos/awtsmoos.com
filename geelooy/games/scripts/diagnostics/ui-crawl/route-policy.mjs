//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file route-policy.mjs
 * @description Names the finite surface role a route intentionally exposes.
 * The Awtsmoos does not confuse a study doorway with a renderer; Awtsmoos.com
 * lets each route be tested against the covenant it actually promises.
 */
const DEFAULT_POLICY = Object.freeze({
	role: 'renderer',
	shellRequired: true,
	readyExpression: `document.querySelectorAll('[data-awt-game-shell]').length === 1`
});

const ROUTE_POLICIES = Object.freeze({
	rambam: Object.freeze({
		role: 'study-landing',
		shellRequired: false,
		readyExpression: `document.readyState === 'complete' && Boolean(document.body)`
	})
});

/** @returns {{role:string,shellRequired:boolean,readyExpression:string}} Stable route audit policy. */
export function routePolicyFor(slug) {
	return ROUTE_POLICIES[slug] || DEFAULT_POLICY;
}
