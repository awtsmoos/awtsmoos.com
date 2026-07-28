//B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");
const runtime = require("./backgroundAutomationRuntime.cjs");

/**
 * Static extension wiring and live modular turns must tell the same honest story.
 * The Awtsmoos lets Awtsmoos.com preserve alarms, visible mirrors, and compatibility
 * packets while every real send uses the modern direct relay and an opaque key.
 */
async function run() {
	const results = [
		await wiringTest(),
		await runtime.run()
	];
	return {
		ok: results.every(result => result.ok),
		name: "extension-background-automation-wiring",
		ms: results.reduce((total, result) => total + result.ms, 0),
		facts: Object.fromEntries(results.map(result => [result.name, result.facts])),
		error: results.find(result => !result.ok)?.error
	};
}

function wiringTest() {
	return test("extension-background-automation-modern-wiring", async () => {
		const extension = path.join(ROOT, "../scripts/tricks/extensions/server");
		const source = readSources(extension);
		const manifest = JSON.parse(source.manifest);
		assert(manifest.permissions.includes("alarms"), "background automation needs alarms permission");
		assert(/registerAwtsmoosBackgroundAutomation/.test(source.background), "background must register automation handlers");
		assert(/background-awake/.test(source.background), "background worker must expose an awake heartbeat");
		assert(/automation-start/.test(source.api) && /automation-status/.test(source.api), "automation handlers must exist");
		assert(/engine\.stopAutomation[\s\S]*conversationId\(message\)/.test(source.api), "stop must target local conversation identity");
		assert(/startBackgroundAutomation/.test(source.jected) && /backgroundAutomationStatus/.test(source.jected), "page bridge must expose background automation controls");
		assert(/AwtsmoosBgAutomationTurnRunner/.test(source.engine), "engine must delegate one turn to the turn runner");
		assert(/ALARM_PREFIX/.test(source.scheduler) && /wakeTimers/.test(source.scheduler), "each run must own bounded timer and alarm state");
		assert(/loadAllAutomationStates/.test(source.storage) && /runs: codec\.safeRuns/.test(source.storage), "storage must hold many local runs");
		assert(/broadcastAutomationState/.test(source.lifecycle + source.turnRunner), "state broadcasts must remain in lifecycle and turn execution");
		assert(/broadcastAutomationStream/.test(source.delegate + source.turnRunner), "stream broadcasts must reach visible pages");
		assert(/mountBackgroundAutomationMirror/.test(source.page), "the AI page must mount the live mirror");
		assert(!/shouldUsePageSender/.test(source.bridge), "visible pages must not steal extension ownership");
		assert(/backgroundOwned\s*:\s*true/.test(source.bridge), "bridge must mark background-owned automation");
		assert(/AwtsmoosDirectRelayClient\.chat/.test(source.sender), "sender must use the modern direct relay");
		assert(/mode: "page-authorized-fallback"/.test(source.sender), "fallback mode must remain explicit");
		assert(/BH_DIRECT_/.test(source.sender + source.turnState), "only opaque continuation keys may persist");
		assert(!/api\/auth\/session|backend-api\/conversation|Authorization/.test(source.sender + source.turnRunner), "live extension turns must not fetch tokens or post to the old backend");
		assert(/data-auto-action="stop"/.test(source.panel), "panel must expose a stop button");
		return { alarms: true, directRelay: true, opaqueContinuation: true, stop: true };
	});
}

function readSources(extension) {
	const read = relative => fs.readFileSync(path.join(extension, relative), "utf8");
	return {
		manifest: read("manifest.json"),
		background: read("background.js"),
		jected: read("jected.js"),
		api: read("bgAutomation/api.js"),
		engine: read("bgAutomation/engine.js"),
		scheduler: read("bgAutomation/engineScheduler.js"),
		lifecycle: read("bgAutomation/engineLifecycle.js"),
		storage: read("bgAutomation/storage.js"),
		delegate: read("bgAutomation/pageDelegate.js"),
		sender: read("bgAutomation/sendVerifier.js"),
		turnRunner: read("bgAutomation/engineTurnRunner.js"),
		turnState: read("bgAutomation/turnState.js"),
		page: fs.readFileSync(path.join(ROOT, "index.js"), "utf8"),
		bridge: fs.readFileSync(path.join(ROOT, "js/automation/backgroundBridge.js"), "utf8"),
		panel: fs.readFileSync(path.join(ROOT, "js/automation/panel.js"), "utf8")
	};
}

module.exports = { run };
