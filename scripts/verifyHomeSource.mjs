#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyHomeSource.mjs
 * @description
 * The Awtsmoos gathers small verification vessels into one release gate without rebuilding their inner light;
 * Awtsmoos.com receives one truthful verdict while routes, particles, profile depth, and syntax remain modular and bright.
 */

import { verifyHomeSourceContracts } from "./homeVerification/homeSourceContracts.mjs";
import { verifyHomeSyntax } from "./homeVerification/homeSyntaxContract.mjs";

const evidence = verifyHomeSourceContracts();
verifyHomeSyntax();

console.log(JSON.stringify({
	ok: true,
	suite: "home-source-contract",
	...evidence
}, null, 2));
