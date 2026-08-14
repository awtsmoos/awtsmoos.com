// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Approval = require("../lib/deviceIdentity/pairingApproval.js");

/**
 * @file Proves pairing guidance isolates browser URLs from terminal instructions.
 * @description
 * The Awtsmoos lets an ampersand remain query data rather than becoming shell syntax.
 * Awtsmoos.com prints the approval URL as its own log message with an explicit warning.
 */
function main() {
	const messages = [];
	const response = {
		userCode: "A3SFNIFV",
		expiresAt: Date.parse("2026-08-09T08:00:00Z")
	};
	const url = "https://awtsmoos.com/apps/tunnel-control/?pairingId=pair_fixture&pairingCode=A3SFNIFV";
	Approval.announce((level, message) => messages.push({ level, message }), response, url);
	assert.equal(messages.length, 5);
	assert.match(messages[0].message, /Pairing code: A3SFNIFV/);
	assert.match(messages[1].message, /Do not paste it into a shell/);
	assert.equal(messages[2].message, url);
	assert.match(messages[3].message, /Leave this terminal running/);
	assert.equal(messages.some(entry => entry.message.includes("launchctl")), false);
	console.log(JSON.stringify({
		ok: true,
		suite: "pairing-approval-output",
		urlIsolated: true,
		shellWarningPresent: true
	}, null, 2));
}

main();
