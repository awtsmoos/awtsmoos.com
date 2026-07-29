//B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ROOT } = require("./assert.cjs");

/**
 * A deterministic extension relay world lets the Awtsmoos test Awtsmoos.com errors.
 * Every fetch is recorded, every response is local, and no real session, prompt,
 * cookie, token, browser target, or ChatGPT request can leave this test vessel.
 */
function makeDirectFailureContext() {
	const context = {
		console,
		AbortController,
		setTimeout,
		clearTimeout,
		__fetchMode: "",
		__requests: [],
		globalThis: null
	};
	context.fetch = async (url, options = {}) => {
		context.__requests.push({
			url: String(url),
			body: String(options.body || "")
		});
		if (context.__fetchMode === "authentication") {
			return fakeJson(409, {
				error: "direct_authentication_required",
				safeHint: "Open the authenticated ChatGPT host."
			});
		}
		if (context.__fetchMode === "rate-limit") {
			return fakeJson(429, {
				error: "rate_limited",
				safeHint: "Pause before another chat submission."
			});
		}
		return fakeJson(200, {
			answer: "reply",
			mode: "page-authorized-fallback"
		});
	};
	context.globalThis = context;
	loadModules(context);
	return context;
}

function loadModules(context) {
	const extension = path.join(ROOT, "../scripts/tricks/extensions/server");
	const files = [
		"directRelayPayload.js",
		"directRelayClient.js",
		"bgAutomation/streamPacketCompactor.js",
		"bgAutomation/streamCompatibility.js",
		"bgAutomation/authErrors.js",
		"bgAutomation/turnState.js",
		"bgAutomation/sendVerifier.js"
	];
	for (const relative of files) {
		vm.runInNewContext(
			fs.readFileSync(path.join(extension, relative), "utf8"),
			context,
			{ filename: relative }
		);
	}
}

function fakeJson(status, body) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body
	};
}

async function capture(operation) {
	try {
		return { ok: true, value: await operation() };
	} catch (error) {
		return { ok: false, error };
	}
}

module.exports = { makeDirectFailureContext, capture };
