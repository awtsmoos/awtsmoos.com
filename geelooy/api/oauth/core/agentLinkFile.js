// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persists hashed Agent Link records without preserving plaintext secrets.
 * @description
 * The Awtsmoos gives the key only at creation, then Awtsmoos.com remembers
 * merely its shadow; constant-time comparison guards the shadow from subtle leak.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function dataDirectory() {
	return path.join(process.env.__awtsdir || process.cwd(), "geelooy", ".data");
}

function agentLinkPath() {
	return path.join(dataDirectory(), "oauth-agent-links.json");
}

function readAgentLinkFile() {
	try {
		const parsed = JSON.parse(fs.readFileSync(agentLinkPath(), "utf8"));
		return parsed && parsed.links ? parsed : { links: {} };
	} catch (error) {
		return { links: {} };
	}
}

function writeAgentLinkFile(store) {
	fs.mkdirSync(dataDirectory(), { recursive: true });
	const target = agentLinkPath();
	const temporary = `${target}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(store, null, 2), "utf8");
	fs.renameSync(temporary, target);
}

function hashAgentLinkSecret(secret) {
	return crypto
		.createHash("sha256")
		.update(String(secret || ""))
		.digest("hex");
}

function agentLinkHashMatches(leftHash, rightHash) {
	try {
		const left = Buffer.from(String(leftHash || ""), "hex");
		const right = Buffer.from(String(rightHash || ""), "hex");
		return left.length === 32
			&& right.length === 32
			&& crypto.timingSafeEqual(left, right);
	} catch (error) {
		return false;
	}
}

module.exports = {
	agentLinkHashMatches,
	agentLinkPath,
	hashAgentLinkSecret,
	readAgentLinkFile,
	writeAgentLinkFile
};
