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
	assert.equal(messages.length, 6);
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

// B"H — TTY box must fit narrow mobile columns without losing the full link.
function testMobileTty() {
    const originalLog = console.log;
    const hadTty = Object.prototype.hasOwnProperty.call(process.stdout, "isTTY");
    const originalTty = process.stdout.isTTY;
    const originalColumns = process.stdout.columns;
    const url = "https://awtsmoos.com/api/tunnel/control/pairing/page?pairingId=test123&pairingCode=CODE1234";
    const lines = [];
    try {
        process.stdout.isTTY = true;
        process.stdout.columns = 32;
        console.log = (...args) => { lines.push(args.join(" ")); };
        Approval.announce(() => {}, { userCode: "CODE1234", expiresAt: Date.now() + 600000 }, url);
    } finally {
        console.log = originalLog;
        if (hadTty) process.stdout.isTTY = originalTty;
        else delete process.stdout.isTTY;
        process.stdout.columns = originalColumns;
    }
    const visible = lines.map(line => line.replace(/\x1b\[[0-9;]*m/g, ""));
    const borders = visible.filter(line => /^[╭│├╰]/u.test(line));
    assert(borders.length >= 5);
    assert(borders.every(line => Array.from(line).length === 32));
    assert(visible.some(line => line.includes(`Full URL: ${url}`)));
}

testMobileTty();
main();
