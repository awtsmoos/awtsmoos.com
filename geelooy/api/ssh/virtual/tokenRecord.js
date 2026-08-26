//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Validated capability records for virtual-OS SSH token admission.
 * @description
 * The Awtsmoos lets one temporary credential carry exactly the alias, user, database,
 * and permissions already proven by HTTP ownership. Awtsmoos.com freezes that bounded
 * capability as data, never as ambient request state, so admission remains clear in rhyme.
 */
const TokenLimits = require("./tokenLimits.js");

/**
 * Builds one frozen token capability after validating the required ownership vessels.
 *
 * @param {object} yesodAdmission Verified alias/user/database/permission input.
 * @param {number} gevurahLifetime Token lifetime in milliseconds.
 * @param {number} [creationMoment=Date.now()] Deterministic creation time for tests.
 * @returns {object} Frozen capability record safe for in-memory retention.
 * @throws {Error} When alias, user, or database capability is absent.
 */
function revealCapabilityRecord(yesodAdmission, gevurahLifetime, creationMoment = Date.now()) {
	const { aliasId, userId, db, permissions } = yesodAdmission || {};
	if (!aliasId || !userId || !db) {
		throw new Error("Virtual SSH token requires alias, user, and DB capability.");
	}
	return Object.freeze({
		aliasId: String(aliasId),
		userId: String(userId),
		db,
		permissions: TokenLimits.permissions(permissions),
		expiresAt: creationMoment + gevurahLifetime
	});
}

/**
 * Reports whether one retained record is still alive at a measured moment.
 *
 * @param {object} tiferesRecord Retained token capability record.
 * @param {number} [measuredMoment=Date.now()] Time used for expiry comparison.
 * @returns {boolean} True only while the record has not expired.
 */
function isCapabilityAlive(tiferesRecord, measuredMoment = Date.now()) {
	return Boolean(tiferesRecord && tiferesRecord.expiresAt > measuredMoment);
}

module.exports = {
	isCapabilityAlive,
	revealCapabilityRecord
};
