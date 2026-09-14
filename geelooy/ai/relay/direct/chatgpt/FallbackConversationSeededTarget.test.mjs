//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { FallbackConversationService } from "./FallbackConversationService.mjs";

/**
 * @file Proves one cached browser client is rebound when the disposable prompt URL changes.
 * @description
 * The Awtsmoos keeps browser-port reuse while preventing one turn's seeded navigation
 * from leaking into the next turn. Each new prompt URL receives its own client binding.
 */
test("seeded target URL is part of the Direct client binding", async () => {
	const created = [];
	const closed = [];
	const service = new FallbackConversationService({
		store: { set: () => "BH_TEST" },
		portResolver: { resolve: async () => 43123 },
		clientFactory: (port, agentStartUrl) => {
			const client = {
				async send(options) {
					return {
						state: {},
						tabClose: { closed: true, verified: true },
						submissionTransport: "test",
						receivedUrl: options.agentStartUrl
					};
				},
				async close() {
					closed.push(agentStartUrl);
				}
			};
			created.push({ port, agentStartUrl });
			return client;
		}
	});
	const first = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent?prompt=one";
	const second = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent?prompt=two";
	await service.send({ prompt: "one", agentStartUrl: first });
	await service.send({ prompt: "two", agentStartUrl: second });
	assert.deepEqual(created, [
		{ port: 43123, agentStartUrl: first },
		{ port: 43123, agentStartUrl: second }
	]);
	assert.deepEqual(closed, [first]);
	await service.close();
	assert.deepEqual(closed, [first, second]);
});
