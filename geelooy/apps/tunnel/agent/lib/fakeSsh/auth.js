// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Short-lived authentication tokens for the fake SSH account boundary.
 * @description The Awtsmoos permits a distant shell only through a measured gate; Awtsmoos.com signs each temporary key, lets it expire, and never writes an account password to state.
 */
const crypto = require("crypto");

const DEFAULT_TTL_MS = 15 * 60 * 1000;

function normalizeUser(value = "") {
	return String(value || "").trim().toLowerCase();
}

function tokenSecret(config = {}) {
	const seed = String(config.fakeSshTokenSecret || config.root || process.cwd());
	return crypto.createHash("sha256").update(`${seed}|fake-ssh-v2`).digest();
}

function sign(config, body) {
	return crypto.createHmac("sha256", tokenSecret(config)).update(body).digest("base64url");
}

function sessionToken(config, input = {}) {
	const now = Date.now();
	const ttlMs = Number(config.fakeSshTokenTtlMs || DEFAULT_TTL_MS);
	const claims = {
		user: normalizeUser(input.user || input.username),
		scope: input.scope || "geelooy-os",
		iat: now,
		exp: now + ttlMs
	};
	const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
	return `${body}.${sign(config, body)}`;
}

function verifyToken(config, token = "", expectedUser = "") {
	const [body, signature] = String(token || "").split(".");
	if (!body || !signature || !safeEqual(signature, sign(config, body))) {
		return null;
	}
	try {
		const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
		if (!claims.exp || claims.exp < Date.now()) {
			return null;
		}
		if (expectedUser && normalizeUser(claims.user) !== normalizeUser(expectedUser)) {
			return null;
		}
		return claims;
	} catch (_) {
		return null;
	}
}

async function authenticate(config, input = {}) {
	const user = normalizeUser(input.username || input.user);
	if (!user) {
		return fail("missing_username");
	}
	const suppliedToken = input.sessionToken || input.accessToken;
	if (suppliedToken && verifyToken(config, suppliedToken, user)) {
		return ok(config, user, "sessionToken");
	}
	if (input.password && verifyToken(config, input.password, user)) {
		return ok(config, user, "passwordToken");
	}
	if (typeof config.verifyAccountPassword === "function") {
		const good = await config.verifyAccountPassword(user, String(input.password || ""));
		return good ? ok(config, user, "accountPasswordVerifier") : fail("bad_password");
	}
	return fail(input.password ? "bad_or_expired_token" : "missing_authenticator");
}

function ok(config, user, method) {
	return {
		ok: true,
		user,
		method,
		sessionToken: sessionToken(config, { user })
	};
}

function fail(error) {
	return {
		ok: false,
		error,
		passwordPolicy: "Use the account verifier or a short-lived fake SSH token. Raw account passwords are never stored."
	};
}

function safeEqual(left, right) {
	const a = Buffer.from(String(left));
	const b = Buffer.from(String(right));
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = {
	authenticate,
	normalizeUser,
	sessionToken,
	verifyToken
};
