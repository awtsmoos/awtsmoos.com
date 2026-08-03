//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticatedSocketController } from "../relay/direct/browser/AuthenticatedSocketController.mjs";
import { ChatGptTargetSelector } from "../relay/direct/browser/ChatGptTargetSelector.mjs";

const customUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/** Existing ChatGPT beats blank and target creation. */
test("target selector reuses an existing ChatGPT page", async () => {
	let fetchCalls = 0;
	const selector = new ChatGptTargetSelector({
		port: 9223,
		discovery: {
			async listTargets() {
				return [
					page("blank", "chrome://newtab/"),
					page("chat", "https://chatgpt.com/#settings")
				];
			}
		},
		fetcher: async () => {
			fetchCalls += 1;
			throw new Error("A new target must not be requested.");
		}
	});
	const acquired = await selector.acquire();
	assert.equal(acquired.target.id, "chat");
	assert.equal(acquired.owned, false);
	assert.equal(acquired.source, "existing-chatgpt");
	assert.equal(fetchCalls, 0);
});

test("target selector prefers the named Shliach over generic and lookalike pages", async () => {
	const selector = new ChatGptTargetSelector({
		port: 9223,
		discovery: {
			async listTargets() {
				return [
					page("lookalike", "https://example.test/?next=chatgpt.com"),
					page("generic", "https://chatgpt.com/"),
					page("shliach", `${customUrl}/c/private-conversation`)
				];
			}
		},
		fetcher: async () => {
			throw new Error("A new target must not be requested.");
		}
	});
	const acquired = await selector.acquire();
	assert.equal(acquired.target.id, "shliach");
	assert.equal(selector.isChatGptPage(page("lookalike", "https://example.test/?next=chatgpt.com")), false);
});

/** Closing a reused controller detaches CDP but leaves the user's tab open. */
test("reused target is detached without closing the tab", async () => {
	const fetchUrls = [];
	let clientClosed = 0;
	const client = {
		async connect() {},
		async send() {},
		close() { clientClosed += 1; }
	};
	const controller = new AuthenticatedSocketController({
		port: 9223,
		targetSelector: {
			async acquire() {
				return { target: page("chat", "https://chatgpt.com/"), owned: false, source: "existing-chatgpt" };
			}
		},
		clientFactory: () => client,
		inspectorFactory: () => ({
			async inspect() { return { authenticated: true, composerVisible: true }; }
		}),
		fetcher: async url => {
			fetchUrls.push(url);
			return { ok: true };
		},
		sleep: async () => undefined
	});
	const host = await controller.open();
	await host.close();
	assert.equal(host.targetSource, "existing-chatgpt");
	assert.equal(host.ownedTarget, false);
	assert.equal(clientClosed, 1);
	assert.equal(fetchUrls.some(url => url.includes("/json/close/")), false);
});

function page(id, url) {
	return {
		id,
		type: "page",
		url,
		webSocketDebuggerUrl: `ws://127.0.0.1/devtools/page/${id}`
	};
}
