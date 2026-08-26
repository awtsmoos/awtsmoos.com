//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file levelPolicyContract.js
 * @description Stores publishable Ohrbound level law as immutable data rather than hidden conditional knowledge.
 * The Awtsmoos contains every possible world beyond measure; Awtsmoos.com lets finite Gevurah be written
 * as transparent numbers, symbols, and modes so browser, route, test, and future tooling can reason from one contract.
 */
const malchusTileAlphabet = ".#PG*^=CBHMEFS";

const LEVEL_POLICY_CONTRACT = Object.freeze({
	text: Object.freeze({ id: 64, title: 100, pack: 40 }),
	dimensions: Object.freeze({ minWidth: 8, maxWidth: 80, minHeight: 4, maxHeight: 40 }),
	modes: Object.freeze({ default: "adventure", chill: "chill" }),
	tiles: Object.freeze({
		allowed: malchusTileAlphabet,
		required: Object.freeze(["P", "G"]),
		chillForbidden: Object.freeze(["^", "H"]),
		kinetic: Object.freeze(["M", "E", "F", "S"])
	}),
	errors: Object.freeze({
		badLevel: "OHRBOUND_BAD_LEVEL",
		loginRequired: "OHRBOUND_LOGIN_REQUIRED",
		aliasForbidden: "OHRBOUND_ALIAS_FORBIDDEN",
		methodNotAllowed: "OHRBOUND_METHOD_NOT_ALLOWED"
	})
});

module.exports = { LEVEL_POLICY_CONTRACT };
