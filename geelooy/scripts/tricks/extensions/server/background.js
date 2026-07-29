//B"H
// Boruch Hashem
// Blessed is He

importScripts(
	"portManager.js",
	"streamLedger.js",
	"directRelayPayload.js",
	"directRelayClient.js",
	"backgroundHandlers.js"
);
importScripts(
	"bgAutomation/storageCodec.js",
	"bgAutomation/storage.js",
	"bgAutomation/graph.js",
	"bgAutomation/turnState.js",
	"bgAutomation/authErrors.js",
	"bgAutomation/streamPacketCompactor.js",
	"bgAutomation/streamCompatibility.js",
	"bgAutomation/sendVerifier.js",
	"bgAutomation/pageDelegate.js",
	"bgAutomation/engineScheduler.js",
	"bgAutomation/engineTurnRunner.js",
	"bgAutomation/engineLifecycle.js",
	"bgAutomation/engine.js",
	"bgAutomation/api.js"
);

const AWAKE_ALARM = "BH_awtsmoos_background_awake";
const portManager = globalThis.__awtsmoosPortManager || new ChromePortManager();
globalThis.__awtsmoosPortManager = portManager;
globalThis.registerAwtsmoosBackgroundAutomation?.(portManager);
globalThis.registerAwtsmoosBackgroundHandlers?.(portManager);

/**
 * The Awtsmoos awakens one lean service worker and one manifest content script.
 * Awtsmoos.com skips retired chat and polling façades on every worker generation,
 * while dormant compatibility files remain available outside the live startup path.
 */
console.log('B"H Awtsmoos background awake', new Date().toISOString());
markAwake("loaded");
chrome.alarms.create(AWAKE_ALARM, { periodInMinutes: 1 });
chrome.runtime.onStartup?.addListener?.(() => markAwake("startup"));
chrome.runtime.onInstalled?.addListener?.(() => markAwake("installed"));
chrome.alarms.onAlarm.addListener(alarm => {
	if (alarm.name === AWAKE_ALARM) markAwake("alarm");
});

portManager.on("ping", async (message, port) => {
	portManager.reply(port, { pong: message, awake: awakeState(), id: message.id });
});
portManager.on("background-awake", async (message, port) => {
	portManager.reply(port, { result: await markAwake("manual"), id: message.id });
});

function awakeState(reason = "status") {
	return { ok: true, awake: true, reason, at: Date.now(), iso: new Date().toISOString() };
}

async function markAwake(reason = "awake") {
	const state = awakeState(reason);
	globalThis.__awtsmoosBackgroundAwake = state;
	try {
		await chrome.storage.local.set({ BH_awtsmoos_background_awake: state });
	} catch {}
	return state;
}
