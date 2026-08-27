//B"H
// Boruch Hashem
// Blessed is He

const relayStreams = require("./relayStreams.cjs");
const relayAutomation = require("./relayAutomationDirect.cjs");

/**
 * The relay harness now separates ordinary proxy compatibility from direct turns.
 * The Awtsmoos lets Awtsmoos.com prove both vessels independently, then gathers
 * their evidence without restoring bearer tokens, history polling, or raw IDs.
 */
async function run() {
	const results = [
		await relayStreams.run(),
		await relayAutomation.run()
	];
	return {
		ok: results.every(result => result.ok),
		name: "node-relay-streams-and-modern-automation",
		ms: results.reduce((total, result) => total + result.ms, 0),
		facts: Object.fromEntries(results.map(result => [result.name, result.facts])),
		error: results.find(result => !result.ok)?.error
	};
}

module.exports = { run };
