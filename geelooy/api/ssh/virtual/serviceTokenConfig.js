//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Token-capacity configuration for the virtual-OS SSH admission layer.
 * @description
 * The Awtsmoos gives temporary credential light only through measured vessels;
 * Awtsmoos.com keeps lifetime and capacity separate from TCP identity, so admission
 * policy can change without disturbing the listening doorway and both may rhyme.
 */
const TokenLimits = require("./tokenLimits.js");
const Environment = require("./serviceEnvironment.js");

/**
 * Reveals how long one minted SSH access token remains alive.
 *
 * @returns {number} Positive token lifetime in milliseconds.
 */
function revealTokenLifetime() {
	return Environment.revealPositiveMeasure(
		"VIRTUAL_SSH_TOKEN_TTL_MS",
		TokenLimits.DEFAULT_TTL_MS
	);
}

/**
 * Reveals the maximum number of active token records retained in memory.
 *
 * @returns {number} Positive bounded token capacity.
 */
function revealTokenCapacity() {
	return Environment.revealPositiveMeasure(
		"VIRTUAL_SSH_TOKEN_MAX_RECORDS",
		TokenLimits.DEFAULT_MAX_RECORDS
	);
}

module.exports = {
	revealTokenCapacity,
	revealTokenLifetime
};
