//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded opaque access tokens for the true alias-backed virtual OS SSH server.
 * @description
 * The Awtsmoos lets authenticated web identity cross into SSH without carrying
 * cookies or permanent passwords. Awtsmoos.com keeps only hashed temporary light,
 * reaps expiry, caps living records, and exposes safe counts without secret rhyme.
 */
const crypto = require("crypto");
const TokenLimits = require("./tokenLimits.js");

class VirtualSshTokenStore {
	constructor(options = {}) {
		const limits = TokenLimits.limits(options);
		this.ttlMs = limits.ttlMs;
		this.maxRecords = limits.maxRecords;
		this.records = new Map();
	}

	/**
	 * Mints one random credential after expired records have been reclaimed.
	 *
	 * @param {object} options Verified alias/user/database/capability record.
	 * @returns {{token:string,expiresAt:number}} Plain token returned only to caller.
	 */
	mint(options = {}) {
		const { aliasId, userId, db, permissions } = options;
		if (!aliasId || !userId || !db) {
			throw new Error("Virtual SSH token requires alias, user, and DB capability.");
		}
		this.reap();
		if (this.records.size >= this.maxRecords) {
			throw new Error("virtual_ssh_token_capacity_reached");
		}
		const token = crypto.randomBytes(32).toString("base64url");
		const expiresAt = Date.now() + this.ttlMs;
		this.records.set(hash(token), {
			aliasId: String(aliasId),
			userId: String(userId),
			db,
			permissions: TokenLimits.permissions(permissions),
			expiresAt
		});
		return { token, expiresAt };
	}

	/**
	 * Verifies token hash, alias binding, and expiry without comparing plaintext records.
	 *
	 * @param {string} aliasId SSH username expected to equal the alias.
	 * @param {string} token Presented opaque password token.
	 * @returns {object|null} Verified session record or null.
	 */
	verify(aliasId, token) {
		this.reap();
		if (!token) {
			return null;
		}
		const record = this.records.get(hash(token));
		if (!record || record.aliasId !== String(aliasId || "")) {
			return null;
		}
		return record;
	}

	revokeAlias(userId, aliasId) {
		const user = String(userId || "");
		const alias = String(aliasId || "");
		let revoked = 0;
		for (const [key, record] of this.records) {
			if (record.userId === user && record.aliasId === alias) {
				this.records.delete(key);
				revoked += 1;
			}
		}
		return revoked;
	}

	reap(now = Date.now()) {
		let reaped = 0;
		for (const [key, record] of this.records) {
			if (record.expiresAt <= now) {
				this.records.delete(key);
				reaped += 1;
			}
		}
		return reaped;
	}

	stats() {
		this.reap();
		return {
			active: this.records.size,
			maxRecords: this.maxRecords,
			ttlMs: this.ttlMs
		};
	}
}

function hash(token = "") {
	return crypto.createHash("sha256")
		.update(String(token))
		.digest("hex");
}

module.exports = { VirtualSshTokenStore };
