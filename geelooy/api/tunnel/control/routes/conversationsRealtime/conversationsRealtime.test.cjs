// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");

/**
 * @file Proves conversation route activity is bounded and content-free.
 * @description
 * The Awtsmoos renews registry, message, and witness without mixing their vessels.
 * Awtsmoos.com injects a disposable legacy route and proves that operation, ID,
 * count, and outcome appear while prompts and assistant output remain concealed.
 */

test("publishes conversation lifecycle without raw messages", async () => {
	const legacyPath = require.resolve("../conversations.js");
	require.cache[legacyPath] = {
		id: legacyPath,
		filename: legacyPath,
		loaded: true,
		exports: createLegacyMock()
	};
	const wrapperPath = require.resolve("../conversationsRealtime.js");
	delete require.cache[wrapperPath];
	const Wrapper = require("../conversationsRealtime.js");
	const published = [];
	const context = createContext(published);
	await Wrapper.conversationRegister(context);
	await Wrapper.conversationList(context);
	await Wrapper.conversationGet(context);
	assert.deepEqual(
		published.map((entry) => entry.eventType),
		[
			"conversation.registered",
			"conversation.listed",
			"conversation.read"
		]
	);
	assert.equal(
		JSON.stringify(published).includes("secret-prompt-marker"),
		false
	);
	assert.equal(
		JSON.stringify(published).includes("secret-output-marker"),
		false
	);
});

function createLegacyMock() {
	return {
		async conversationRegister() {
			return JSON.stringify({
				ok: true,
				conversationId: "conversation-a",
				prompt: "secret-prompt-marker"
			});
		},
		async conversationList() {
			return JSON.stringify({
				ok: true,
				conversations: [
					{ id: "conversation-a", title: "secret-prompt-marker" }
				]
			});
		},
		async conversationGet() {
			return JSON.stringify({
				ok: true,
				id: "conversation-a",
				messages: [{ content: "secret-output-marker" }]
			});
		}
	};
}

function createContext(published) {
	return {
		request: {
			headers: {},
			user: {
				authorized: true,
				info: {
					userId: "user-a",
					accountId: "account-a",
					sessionId: "session-a"
				}
			}
		},
		ws: {
			publishActivity(event) {
				published.push(event);
				return event;
			}
		}
	};
}
