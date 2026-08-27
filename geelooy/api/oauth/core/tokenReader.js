// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { getClient } = require("./clients.js");
const ScopeEvolution = require("./scopeEvolution.js");
const { secretString } = require("./serverSecret.js");

function signaturesMatch(actual, expected) {
	const actualBuffer = Buffer.from(String(actual));
	const expectedBuffer = Buffer.from(String(expected));
	if (actualBuffer.length !== expectedBuffer.length) {
		return false;
	}
	return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function decodeToken(token) {
	const parts = String(token || "").split(".");
	if (parts.length !== 3 || parts[0] !== "B\"H") {
		return { ok: false, error: "bad_token_shape" };
	}
	const payload = `${parts[0]}.${parts[1]}`;
	return {
		ok: true,
		parts,
		payload
	};
}

function parsePayload(encoded) {
	try {
		return {
			ok: true,
			decoded: JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"))
		};
	} catch (error) {
		return { ok: false, error: "bad_payload", details: error.message };
	}
}

function evolvedEntry(entry = {}) {
	const client = getClient(entry.clientId);
	return client ? ScopeEvolution.evolveEntry(client, entry) : { ...entry };
}

function verifyAwtsmoosOAuthToken(token, secret) {
	const shape = decodeToken(token);
	if (!shape.ok) {
		return shape;
	}
	const expected = crypto
		.createHmac("sha256", String(secret))
		.update(shape.payload)
		.digest("hex");
	if (!signaturesMatch(shape.parts[2], expected)) {
		return { ok: false, error: "bad_signature" };
	}
	const parsed = parsePayload(shape.parts[1]);
	if (!parsed.ok) {
		return parsed;
	}
	const rawEntry = parsed.decoded.entry || parsed.decoded;
	if (!rawEntry || rawEntry.kind !== "oauth_access") {
		return { ok: false, error: "wrong_token_kind" };
	}
	const issuedAt = Number(parsed.decoded.zman || rawEntry.createdAt || 0);
	const expiresIn = Number(parsed.decoded.hoshufuh?.expiresIn || 3600);
	if (issuedAt && Date.now() > issuedAt + expiresIn * 1000) {
		return { ok: false, error: "token_expired" };
	}
	const entry = evolvedEntry(rawEntry);
	return {
		ok: true,
		raw: { ...parsed.decoded, entry },
		entry
	};
}

function readBearer($i) {
	const authorization = $i.request?.headers?.authorization || "";
	const token = authorization.replace(/^Bearer\s+/i, "").trim();
	if (!token) {
		return { ok: false, error: "missing_bearer_token" };
	}
	const result = verifyAwtsmoosOAuthToken(token, secretString($i));
	if (!result.ok) {
		return {
			ok: false,
			error: "invalid_token",
			details: result.error,
			more: result.details || null
		};
	}
	return {
		ok: true,
		token,
		raw: result.raw,
		entry: result.entry
	};
}

module.exports = {
	readBearer,
	verifyAwtsmoosOAuthToken
};
