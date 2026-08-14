// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DetachedConversationSession } from "./DetachedConversationSession.mjs";

test("detached session keeps only ChatGPT cookies and approved request headers", async () => {
	const client = {
		async send(method) {
			if (method === "Network.getAllCookies") {
				return {
					cookies: [
						{ domain: ".chatgpt.com", name: "session", value: "secret" },
						{ domain: "auth.chatgpt.com", name: "auth", value: "token" },
						{ domain: "example.com", name: "unrelated", value: "ignore" }
					]
				};
			}
			if (method === "Runtime.evaluate") {
				return { result: { value: "Fixture Browser" } };
			}
			throw new Error(`unexpected_${method}`);
		}
	};
	const session = await new DetachedConversationSession().capture(client, {
		requestHeaders: {
			Authorization: "Bearer private",
			"OAI-Device-Id": "device-private",
			"Content-Type": "application/json",
			"X-Unrelated": "ignore"
		}
	});
	assert.equal(session.cookieHeader, "session=secret; auth=token");
	assert.equal(session.userAgent, "Fixture Browser");
	assert.deepEqual(session.headers, {
		authorization: "Bearer private",
		"oai-device-id": "device-private"
	});
	assert.equal(JSON.stringify(session).includes("unrelated"), false);
});
