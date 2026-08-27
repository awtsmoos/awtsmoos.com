//B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * Two independent runs reveal the Awtsmoos.com extension's real modular lifecycle.
 * The Awtsmoos permits only opaque continuation keys, one committed send per turn,
 * direct verifier ownership, and zero wake timers after each run reaches maximum.
 */
function run() {
	return test("background-engine-runs-multiple-direct-conversations", async () => {
		const folder = path.join(ROOT, "../scripts/tricks/extensions/server/bgAutomation");
		const context = makeContext();
		loadModules(folder, context);
		await context.AwtsmoosBgAutomationEngine.startAutomation(config("conv-a", 2));
		await context.AwtsmoosBgAutomationEngine.startAutomation(config("conv-b", 3));
		await Promise.resolve();
		for (let index = 0; index < 8; index += 1) {
			context.__now += 1000;
			await context.AwtsmoosBgAutomationEngine.tickAutomation("test");
		}
		const status = await context.AwtsmoosBgAutomationEngine.statusAutomation();
		const byId = Object.fromEntries(status.runs.map(item => [item.conversationId, item]));
		assert(byId["conv-a"]?.turns === 2 && !byId["conv-a"]?.enabled, "conv-a must finish at two turns", byId);
		assert(byId["conv-b"]?.turns === 3 && !byId["conv-b"]?.enabled, "conv-b must finish at three turns", byId);
		assert(context.__sends.filter(item => item.conversationId === "conv-a").length === 2, "conv-a sends exactly twice", context.__sends);
		assert(context.__sends.filter(item => item.conversationId === "conv-b").length === 3, "conv-b sends exactly three times", context.__sends);
		assert(context.__sends.filter(item => item.conversationKey).every(item => item.conversationKey.startsWith("BH_DIRECT_")), "continuations must stay opaque", context.__sends);
		assert(!JSON.stringify(status).includes("BH_DIRECT_"), "public status must hide transport continuation", status);
		assert(context.AwtsmoosBgAutomationEngine.resourceStatus().timers === 0, "completed runs must own no wake timers");
		context.AwtsmoosBgAutomationScheduler.dispose();
		assert(context.AwtsmoosBgAutomationEngine.resourceStatus().alarmListener === 0, "dispose must remove the alarm listener");
		return { sends: context.__sends.length, convA: 2, convB: 3, timers: 0 };
	});
}

function config(conversationId, maxTurns) {
	return { conversationId, settings: { enabled: true, maxTurns, delayMs: 250, prompt: `continue ${conversationId}` } };
}

function loadModules(folder, context) {
	const files = [
		"authErrors.js", "turnState.js", "storageCodec.js", "storage.js",
		"graph.js", "engineScheduler.js", "engineLifecycle.js",
		"engineTurnRunner.js", "engine.js"
	];
	for (const name of files) {
		vm.runInNewContext(fs.readFileSync(path.join(folder, name), "utf8"), context, { filename: name });
	}
}

function makeContext() {
	const rawStore = {};
	const listeners = new Set();
	const context = {
		console,
		Promise,
		__now: 1000,
		__sends: [],
		setTimeout: () => Symbol("timer"),
		clearTimeout: () => undefined,
		globalThis: null
	};
	context.Date = class extends Date {
		constructor(...args) { super(...(args.length ? args : [context.__now])); }
		static now() { return context.__now; }
	};
	context.chrome = {
		storage: { local: {
			get(keys, callback) {
				const list = Array.isArray(keys) ? keys : [keys];
				callback(Object.fromEntries(list.map(key => [key, rawStore[key]])));
			},
			set(value, callback) { Object.assign(rawStore, value); callback?.(); }
		} },
		alarms: {
			create() {},
			clear() {},
			onAlarm: { addListener(listener) { listeners.add(listener); }, removeListener(listener) { listeners.delete(listener); } }
		}
	};
	context.AwtsmoosBgSendVerifier = { sendAndVerify: async options => fakeSend(context, options) };
	context.AwtsmoosBgPageDelegate = { broadcastAutomationState() {}, broadcastAutomationStream() {} };
	context.globalThis = context;
	return context;
}

function fakeSend(context, options) {
	const prior = context.__sends.filter(item => item.conversationId === options.conversationId).length;
	context.__sends.push({ conversationId: options.conversationId, conversationKey: options.conversationKey || "" });
	return { ok: true, text: `reply ${options.conversationId} ${prior + 1}`, conversationKey: `BH_DIRECT_${options.conversationId}_${prior + 1}` };
}

module.exports = { run };
