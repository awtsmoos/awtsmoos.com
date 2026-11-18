//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Persists dynamic OAuth clients without preserving plaintext secrets.
 * @description
 * The Awtsmoos gives Claude its confidential key once, then Awtsmoos.com keeps only shade;
 * the client returns through PKCE, redirect, audience, and timing-safe secret law unafraid.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { agentLinkPath } = require("./agentLinkFile.js");
const { clientFromRegistration } = require("./dynamicClientPolicy.js");
const Secret = require("./dynamicClientSecret.js");

function storePath() {
	return path.join(path.dirname(agentLinkPath()), "oauth-mcp-clients.json");
}

function readStore() {
	try {
		const file = storePath();
		if (fs.statSync(file).size > 16 * 1024 * 1024) {
			throw new Error("registration_capacity_reached");
		}
		const store = JSON.parse(fs.readFileSync(file, "utf8"));
		if (!store.clients || typeof store.clients !== "object" || Array.isArray(store.clients)) {
			throw new Error("registration_store_invalid");
		}
		return store;
	} catch (error) {
		if (error.code === "ENOENT") return { clients: {} };
		throw error;
	}
}

function writeStore(store) {
	const target = storePath();
	fs.mkdirSync(path.dirname(target), { recursive: true });
	const temporary = target + "." + crypto.randomBytes(12).toString("hex") + ".tmp";
	try {
		fs.writeFileSync(temporary, JSON.stringify(store), { mode: 0o600, flag: "wx" });
		fs.renameSync(temporary, target);
	} finally {
		if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
	}
}

/** Registers one client, returning a plaintext secret only for the creation response. */
function registerClient(metadata) {
	const store = readStore();
	if (Object.keys(store.clients).length >= 10000) {
		throw new Error("registration_capacity_reached");
	}
	const issuedAt = Math.floor(Date.now() / 1000);
	const clientId = "mcp_" + crypto.randomBytes(24).toString("hex");
	const confidential = metadata.token_endpoint_auth_method !== "none";
	const clientSecret = confidential ? Secret.generateSecret() : "";
	const record = {
		...metadata,
		client_id: clientId,
		client_id_issued_at: issuedAt,
		...(confidential ? {
			client_secret_hash: Secret.digestSecret(clientSecret),
			client_secret_expires_at: 0
		} : {})
	};
	store.clients[clientId] = record;
	writeStore(store);
	return {
		...metadata,
		client_id: clientId,
		client_id_issued_at: issuedAt,
		...(confidential ? {
			client_secret: clientSecret,
			client_secret_expires_at: 0
		} : {})
	};
}

/** Loads dynamic policy and attaches a digest-backed secret verifier. */
function getDynamicClient(id) {
	if (!/^mcp_[a-f0-9]{48}$/.test(String(id))) return null;
	const record = readStore().clients[id];
	if (!record) return null;
	return {
		...clientFromRegistration(record),
		secretAllowed(candidate) {
			if (!record.client_secret_hash) return true;
			return Secret.secretMatches(record.client_secret_hash, candidate);
		}
	};
}

module.exports = {
	getDynamicClient,
	readStore,
	registerClient,
	storePath
};
