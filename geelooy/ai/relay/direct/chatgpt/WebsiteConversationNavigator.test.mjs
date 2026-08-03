// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { WebsiteConversationNavigator } from "./WebsiteConversationNavigator.mjs";

const startUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

function readyPage(url = startUrl) {
	return {
		url,
		authenticated: true,
		composerVisible: true
	};
}

function fixture(states) {
	const sends = [];
	let index = 0;
	const controller = {
		cdpClient: {
			send: async (method, params) => {
				sends.push({ method, params });
				return {};
			}
		},
		inspector: {
			inspect: async () => states[Math.min(index++, states.length - 1)]
		}
	};
	const navigator = new WebsiteConversationNavigator({
		sleep: async () => {},
		intervalMs: 0,
		stabilizationMs: 0
	});
	return { controller, navigator, sends };
}

test("ready exact GPT route is preserved without redundant navigation", async () => {
	const state = fixture([readyPage(), readyPage(), readyPage()]);
	const result = await state.navigator.prepare(state.controller, null, startUrl, 1000);
	assert.equal(result.url, startUrl);
	assert.deepEqual(state.sends, []);
});

test("unready route navigates once and then stabilizes", async () => {
	const state = fixture([
		readyPage("about:blank"),
		readyPage(startUrl),
		readyPage(startUrl)
	]);
	const result = await state.navigator.prepare(state.controller, null, startUrl, 1000);
	assert.equal(result.url, startUrl);
	assert.deepEqual(state.sends, [{
		method: "Page.navigate",
		params: { url: startUrl }
	}]);
});
