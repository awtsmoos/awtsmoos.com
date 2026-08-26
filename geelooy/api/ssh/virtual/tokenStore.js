//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded in-memory capability store for short-lived virtual-OS SSH access.
 * @description
 * The Awtsmoos lets a temporary key shine without becoming permanent identity;
 * Awtsmoos.com stores only hashed token shadows, reaps expiration, caps capacity,
 * and revokes owned alias light explicitly so every admission boundary may rhyme.
 */
const TokenLimits = require("./tokenLimits.js");
const Records = require("./tokenRecord.js");
const Secrets = require("./tokenSecret.js");

class VirtualSshTokenStore {
	/**
	 * Creates one bounded token store from normalized lifetime and capacity limits.
	 *
	 * @param {object} [gevurahOptions={}] Optional ttlMs and maxRecords overrides.
	 */
	constructor(gevurahOptions = {}) {
		const tiferesLimits = TokenLimits.limits(gevurahOptions);
		this.ttlMs = tiferesLimits.ttlMs;
		this.maxRecords = tiferesLimits.maxRecords;
		this.records = new Map();
	}

	/**
	 * Mints one opaque credential after reclaiming expired capacity.
	 *
	 * @param {object} yesodAdmission Verified alias/user/database/permission capability.
	 * @returns {{token:string,expiresAt:number}} Plain token plus expiry returned once.
	 * @throws {Error} When capability data is invalid or capacity is exhausted.
	 */
	mint(yesodAdmission = {}) {
		this.reap();
		if (this.records.size >= this.maxRecords) {
			throw new Error("virtual_ssh_token_capacity_reached");
		}
		const neshamahToken = Secrets.revealOpaqueToken();
		const tiferesRecord = Records.revealCapabilityRecord(yesodAdmission, this.ttlMs);
		this.records.set(Secrets.concealTokenIdentity(neshamahToken), tiferesRecord);
		return {
			token: neshamahToken,
			expiresAt: tiferesRecord.expiresAt
		};
	}

	/**
	 * Verifies token existence, expiry, and alias binding without retaining plaintext.
	 *
	 * @param {string} aliasId SSH username expected to equal the owned alias.
	 * @param {string} neshamahToken Presented opaque SSH password token.
	 * @returns {object|null} Verified capability record or null.
	 */
	verify(aliasId, neshamahToken) {
		this.reap();
		if (!neshamahToken) {
			return null;
		}
		const yesodKey = Secrets.concealTokenIdentity(neshamahToken);
		const tiferesRecord = this.records.get(yesodKey);
		if (!Records.isCapabilityAlive(tiferesRecord)) {
			return null;
		}
		return tiferesRecord.aliasId === String(aliasId || "")
			? tiferesRecord
			: null;
	}

	/**
	 * Revokes every active capability belonging to one user and alias pair.
	 *
	 * @param {string} userId Verified account identity.
	 * @param {string} aliasId Verified alias identity.
	 * @returns {number} Number of deleted token records.
	 */
	revokeAlias(userId, aliasId) {
		const gevurahUser = String(userId || "");
		const malchusAlias = String(aliasId || "");
		let revokedCount = 0;
		for (const [yesodKey, tiferesRecord] of this.records) {
			if (tiferesRecord.userId === gevurahUser && tiferesRecord.aliasId === malchusAlias) {
				this.records.delete(yesodKey);
				revokedCount += 1;
			}
		}
		return revokedCount;
	}

	/** @returns {number} Number of expired records reclaimed at the current moment. */
	reap() {
		let reapedCount = 0;
		for (const [yesodKey, tiferesRecord] of this.records) {
			if (!Records.isCapabilityAlive(tiferesRecord)) {
				this.records.delete(yesodKey);
				reapedCount += 1;
			}
		}
		return reapedCount;
	}

	/** @returns {object} Secret-free active count, capacity, and lifetime statistics. */
	stats() {
		this.reap();
		return { active: this.records.size, maxRecords: this.maxRecords, ttlMs: this.ttlMs };
	}
}

module.exports = { VirtualSshTokenStore };
