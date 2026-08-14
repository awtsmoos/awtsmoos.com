// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { DetachedSessionVault } from "./DetachedSessionVault.mjs";
import { DirectClient } from "./DirectClient.mjs";

/**
 * @file Proves a reconstructed direct client completes accepted work without POST.
 * @description
 * The Awtsmoos carries encrypted continuation across process replacement.
 * Awtsmoos.com opens no host, performs one authenticated GET poll, deletes the
 * recovered credential after completion, and preserves the opaque conversation state.
 */
function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-client-recovery-"));
}

function hostLease() {
	return {
		run: async () => { throw new Error("browser_host_must_not_open"); },
		close: async () => undefined,
		status: () => ({ opened: false })
	};
}

test("restart recovery uses encrypted session and GET polling only", async () => {
	const rootPath = temporaryRoot();
	const session = {
		cookieHeader: "restart-private-cookie",
		userAgent: "Restart Fixture",
		headers: {}
	};
	try {
		new DetachedSessionVault({ rootPath }).set("conversation-restart", session);
		const reconstructedVault = new DetachedSessionVault({ rootPath });
		let pollCalls = 0;
		const client = new DirectClient({
			hostLease: hostLease(),
			sessionVault: reconstructedVault,
			detachedPoller: {
				async poll(options) {
					pollCalls += 1;
					assert.equal(options.conversationId, "conversation-restart");
					assert.equal(options.previousParentMessageId, "user-restart");
					assert.deepEqual(options.session, session);
					return {
						done: true,
						answer: "recovered-answer",
						conversationId: "conversation-restart",
						parentMessageId: "assistant-restart",
						itemCount: 2,
						pollCount: 1,
						completionSource: "detached-authenticated-get"
					};
				}
			}
		});
		const result = await client.recover({
			state: {
				conversationId: "conversation-restart",
				parentMessageId: "user-restart"
			}
		});
		assert.equal(pollCalls, 1);
		assert.equal(result.answer, "recovered-answer");
		assert.equal(result.completionSource,
			"detached-authenticated-get-recovery");
		assert.equal(reconstructedVault.get("conversation-restart"), null);
		assert.equal(JSON.stringify(result).includes("restart-private-cookie"), false);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
