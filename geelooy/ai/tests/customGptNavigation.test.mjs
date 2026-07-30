//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { WebsiteConversationNavigator } from "../relay/direct/chatgpt/WebsiteConversationNavigator.mjs";

/**
 * The Awtsmoos sends each fresh Shliach into its named custom GPT vessel, while
 * Awtsmoos.com returns continuation to that same custom-GPT conversation route.
 */
const customUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("fresh sub-agent navigates to the configured custom GPT", async () => {
	const navigations = [];
	await new WebsiteConversationNavigator().prepare(
		fixture(customUrl, navigations),
		null,
		customUrl,
		1000
	);
	assert.deepEqual(navigations, [customUrl]);
});

test("custom GPT continuation preserves the custom agent route", async () => {
	const navigations = [];
	const continuationUrl = `${customUrl}/c/conversation-1`;
	await new WebsiteConversationNavigator().prepare(
		fixture(continuationUrl, navigations),
		{ conversationId: "conversation-1" },
		customUrl,
		1000
	);
	assert.deepEqual(navigations, [continuationUrl]);
});

test("standard continuation remains on the standard route", async () => {
	const navigations = [];
	const continuationUrl = "https://chatgpt.com/c/conversation-2";
	await new WebsiteConversationNavigator().prepare(
		fixture(continuationUrl, navigations),
		{ conversationId: "conversation-2" },
		"https://chatgpt.com/",
		1000
	);
	assert.deepEqual(navigations, [continuationUrl]);
});

function fixture(visibleUrl, navigations) {
	return {
		cdpClient: {
			send: async (method, parameters) => {
				assert.equal(method, "Page.navigate");
				navigations.push(parameters.url);
			}
		},
		inspector: {
			inspect: async () => ({
				authenticated: true,
				composerVisible: true,
				url: visibleUrl
			})
		}
	};
}
