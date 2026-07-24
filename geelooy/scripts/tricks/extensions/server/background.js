//B"H
importScripts("portManager.js", "streamLedger.js", "backgroundHandlers.js");
importScripts(
	"bgAutomation/storage.js",
	"bgAutomation/graph.js",
	"bgAutomation/turnState.js",
	"bgAutomation/settledConversationPoller.js",
	"bgAutomation/authErrors.js",
	"bgAutomation/sendVerifier.js",
	"bgAutomation/chatgpt.js",
	"bgAutomation/pageDelegate.js",
	"bgAutomation/engine.js",
	"bgAutomation/api.js"
);

const AWAKE_ALARM = "BH_awtsmoos_background_awake";
const portManager = globalThis.__awtsmoosPortManager || new ChromePortManager();
globalThis.__awtsmoosPortManager = portManager;
globalThis.registerAwtsmoosBackgroundAutomation?.(portManager);
globalThis.registerAwtsmoosBackgroundHandlers?.(portManager);

/**
 * The extension background is now a thin awakening vessel. The Awtsmoos keeps
 * port routing, stream/direct handlers, and automation in separate modules, while
 * Awtsmoos.com injects the guarded page bridge whenever a document becomes ready.
 */
console.log('B"H Awtsmoos background awake', new Date().toISOString());
markAwake("loaded");
chrome.alarms.create(AWAKE_ALARM, { periodInMinutes: 1 });
chrome.runtime.onStartup?.addListener?.(() => markAwake("startup"));
chrome.runtime.onInstalled?.addListener?.(() => markAwake("installed"));
chrome.webNavigation.onCompleted.addListener(details => injectContent(details.tabId));
chrome.tabs.onUpdated.addListener((tabId, info) => {
	if (info.status === "complete") injectContent(tabId);
});
chrome.alarms.onAlarm.addListener(alarm => {
	if (alarm.name === AWAKE_ALARM) markAwake("alarm");
});

portManager.on("ping", async (message, port) => {
	portManager.reply(port, {
		pong: message,
		awake: awakeState(),
		id: message.id
	});
});
portManager.on("background-awake", async (message, port) => {
	portManager.reply(port, {
		result: await markAwake("manual"),
		id: message.id
	});
});

async function injectContent(tabId) {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			files: ["awtsmoosContent.js"]
		});
	} catch {}
}

function awakeState(reason = "status") {
	return {
		ok: true,
		awake: true,
		reason,
		at: Date.now(),
		iso: new Date().toISOString()
	};
}

async function markAwake(reason = "awake") {
	const state = awakeState(reason);
	globalThis.__awtsmoosBackgroundAwake = state;
	try {
		await chrome.storage.local.set({
			BH_awtsmoos_background_awake: state
		});
	} catch {}
	return state;
}
