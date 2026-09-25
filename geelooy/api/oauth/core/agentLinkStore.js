// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the lifecycle of durable, revocable external-agent identities.
 * @description
 * The Awtsmoos gives one hidden key while Awtsmoos.com preserves only its hash;
 * sessions may vanish, tunnels may turn, yet the bounded account covenant lasts.
 */

const crypto = require("crypto");
const File = require("./agentLinkFile.js");
const {
	AGENT_LINK_SECRET_PREFIX,
	normalizeAgentLinkName
} = require("./agentLinkPolicy.js");

function publicAgentLink(record) {
	if (!record) {
		return null;
	}
	return {
		id: record.id,
		name: record.name,
		clientId: record.clientId,
		scope: record.scope,
		createdAt: record.createdAt,
		lastUsedAt: record.lastUsedAt,
		revoked: Boolean(record.revoked),
		revokedAt: record.revokedAt || null
	};
}

function createAgentLink(details) {
	const secret = AGENT_LINK_SECRET_PREFIX + crypto.randomBytes(48).toString("base64url");
	const id = "link_" + crypto.randomBytes(18).toString("base64url");
	const store = File.readAgentLinkFile();
	const record = {
		id,
		secretHash: File.hashAgentLinkSecret(secret),
		userId: String(details.userId),
		clientId: String(details.clientId),
		name: normalizeAgentLinkName(details.name),
		scope: String(details.scope || ""),
		createdAt: Date.now(),
		lastUsedAt: null,
		revoked: false,
		revokedAt: null
	};
	store.links[id] = record;
	File.writeAgentLinkFile(store);
	return { link: publicAgentLink(record), secret };
}

function readAgentLinkById(id) {
	return File.readAgentLinkFile().links[String(id || "")] || null;
}

function readAgentLinkBySecret(secret) {
	const hash = File.hashAgentLinkSecret(secret);
	return Object.values(File.readAgentLinkFile().links)
		.find(record => File.agentLinkHashMatches(record.secretHash, hash)) || null;
}

function listAgentLinksForUser(userId) {
	return Object.values(File.readAgentLinkFile().links)
		.filter(record => String(record.userId) === String(userId))
		.map(publicAgentLink)
		.sort((left, right) => right.createdAt - left.createdAt);
}

function touchAgentLink(id) {
	const store = File.readAgentLinkFile();
	if (!store.links[id]) {
		return false;
	}
	store.links[id].lastUsedAt = Date.now();
	File.writeAgentLinkFile(store);
	return true;
}

function revokeAgentLink(userId, id) {
	const store = File.readAgentLinkFile();
	const record = store.links[id];
	if (!record || String(record.userId) !== String(userId)) {
		return false;
	}
	record.revoked = true;
	record.revokedAt = Date.now();
	File.writeAgentLinkFile(store);
	return true;
}

module.exports = {
	createAgentLink,
	listAgentLinksForUser,
	publicAgentLink,
	readAgentLinkById,
	readAgentLinkBySecret,
	revokeAgentLink,
	touchAgentLink
};
