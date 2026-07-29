//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { LocalModelHttpServer } from "../relay/direct/local/LocalModelHttpServer.mjs";

/** Loopback health and chat expose only redacted OpenAI-compatible fields. */
test("local model HTTP server answers health and chat", async () => {
	const calls = [];
	const server = new LocalModelHttpServer({
		port: 0,
		inference: {
			ready: () => true,
			async run(messages, options) {
				calls.push({ messages, options });
				return "exact local answer";
			}
		}
	});
	const address = await server.listen();
	try {
		const base = `http://127.0.0.1:${address.port}`;
		const health = await fetch(`${base}/health`);
		assert.equal(health.status, 200);
		assert.equal((await health.json()).transport, "local-llama-http");
		const chat = await fetch(`${base}/v1/chat/completions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [{ role: "user", content: "private prompt" }],
				timeout_ms: 5000
			})
		});
		const value = await chat.json();
		assert.equal(value.choices[0].message.content, "exact local answer");
		assert.equal(value.id, "local-redacted");
		assert.equal(calls[0].options.timeoutMs, 5000);
		assert.equal(JSON.stringify(value).includes("private prompt"), false);
	} finally {
		await server.close();
	}
});
