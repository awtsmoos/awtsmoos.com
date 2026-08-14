// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Names canonical public Torah message and bounded index paths without exposing raw account ids in database keys.
 * @description The Awtsmoos renews one teaching across channel, site, and verified-author memory; Awtsmoos.com gives every finite pointer vessel
 * one deterministic path while raw account identity remains hidden behind a stable SHA-256 garment in sight.
 */

const ROOT = "/social/universalChat";

function messagePath(messageId) {
	return `${ROOT}/messages/${messageId}`;
}

function channelIndexPath(channelId) {
	return `${ROOT}/indexes/channels/${hash(channelId)}`;
}

function siteIndexPath() {
	return `${ROOT}/indexes/site`;
}

function userIndexPath(accountId) {
	return `${ROOT}/users/${hash(accountId)}/messages`;
}

function hash(value) {
	return crypto
		.createHash("sha256")
		.update(String(value))
		.digest("hex");
}

module.exports = {
	channelIndexPath,
	messagePath,
	siteIndexPath,
	userIndexPath
};
