//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT, assert, test } = require("./assert.cjs");
const runtime = require("./backgroundAutomationRuntime.cjs");

/**
 * Continuation remains both executable and statically bounded to opaque local keys.
 * The Awtsmoos lets Awtsmoos.com continue independent runs without session tokens,
 * raw upstream identifiers, history polling, or duplicate background send façades.
 */
async function run() {
	const results = [
		await sourceBoundary(),
		await runtime.run()
	];
	return {
		ok: results.every(result => result.ok),
		name: "automation-continuance-modern-direct",
		ms: results.reduce((total, result) => total + result.ms, 0),
		facts: Object.fromEntries(results.map(result => [result.name, result.facts])),
		error: results.find(result => !result.ok)?.error
	};
}

function sourceBoundary() {
	return test("automation-continuance-opaque-source-boundary", async () => {
		const extension = path.join(ROOT, "../scripts/tricks/extensions/server");
		const read = relative => fs.readFileSync(path.join(extension, relative), "utf8");
		const runner = read("bgAutomation/engineTurnRunner.js");
		const sender = read("bgAutomation/sendVerifier.js");
		const turnState = read("bgAutomation/turnState.js");
		const background = read("background.js");
		const source = [runner, sender, turnState].join("\n");
		assert(/AwtsmoosBgSendVerifier\.sendAndVerify/.test(runner), "turn runner must call the verifier directly");
		assert(/BH_DIRECT_/.test(sender + turnState), "opaque continuation keys must remain required");
		assert(!/AwtsmoosBgChatGpt/.test(runner), "retired chat facade must not remain in the live turn path");
		assert(!/settledConversationPoller\.js|bgAutomation\/chatgpt\.js/.test(background), "retired facades must not load at worker startup");
		assert(!/api\/auth\/session|backend-api\/conversation|Authorization|Bearer|parentMessageId/.test(source), "live continuation must omit legacy token and upstream identifier machinery");
		return { directVerifier: true, opaqueKey: true, retiredImports: false };
	});
}

module.exports = { run };
