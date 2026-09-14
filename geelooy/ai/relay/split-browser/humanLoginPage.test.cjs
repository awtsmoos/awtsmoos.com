//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Login = require("./humanLoginPage.cjs");
const Config = require("./config.cjs");

const SHLIACH = Config.configuredAgentStartUrl();

/**
 * @file Proves the login sentinel is exact, authority-bound, and safely recreated.
 * @description
 * Generic ChatGPT tabs never impersonate Shliach, and a missing browser port can never
 * fall through to a familiar magic number owned by another Chrome process.
 */
test("human login page requires explicit Shared AI Browser authority", async () => {
	await assert.rejects(
		() => Login.ensureHumanLoginPage({ requestJson: async () => [] }),
		error => error.code === "shared_ai_browser_port_required"
	);
});

test("existing exact Shliach sentinel is reused instead of generic ChatGPT", async () => {
	const calls = [];
	const pages = [
		{ id: "GENERIC", type: "page", url: "https://chatgpt.com/" },
		{ id: "SHLIACH", type: "page", url: SHLIACH }
	];
	const result = await Login.ensureHumanLoginPage({
		debugPort: 4567,
		requestJson: async url => {
			calls.push(url);
			return url.includes("/json/list") ? pages : {};
		}
	});
	assert.equal(result.opened, false);
	assert.equal(result.targetId, "SHLIACH");
	assert.equal(calls.some(url => url.includes("/json/new")), false);
});

test("missing sentinel creates one owned blank target and navigates only that target", async () => {
	const blank = {
		id: "OWNED",
		type: "page",
		url: "about:blank",
		webSocketDebuggerUrl: "ws://example.invalid/devtools/page/OWNED"
	};
	let navigated = false;
	const calls = [];
	const result = await Login.ensureHumanLoginPage({
		debugPort: 4567,
		pollMs: 1,
		requestJson: async (url, method) => {
			calls.push({ url, method });
			if (url.includes("/json/new")) return blank;
			if (url.includes("/json/list")) {
				return navigated ? [{ ...blank, url: SHLIACH }] : [];
			}
			return {};
		},
		navigateTarget: async (target, url) => {
			assert.equal(target.id, "OWNED");
			assert.equal(url, SHLIACH);
			navigated = true;
		}
	});
	assert.equal(result.opened, true);
	assert.equal(result.targetId, "OWNED");
	assert.ok(calls.some(call => call.url.includes("/json/activate/OWNED")));
});

test("isShliach accepts only the configured GPT route and its conversation path", () => {
	assert.equal(Login.isShliach(SHLIACH), true);
	assert.equal(Login.isShliach(`${SHLIACH}/c/example`), true);
	assert.equal(Login.isShliach("https://chatgpt.com/"), false);
	assert.equal(Login.isShliach("https://example.com/"), false);
});
