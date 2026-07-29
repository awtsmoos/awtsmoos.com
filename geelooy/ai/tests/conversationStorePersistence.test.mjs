// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";

test("opaque website continuations persist privately and can be deleted", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-conversation-store-"));
	const storagePath = path.join(root, "private", "conversations.json");
	try {
		const first = new ConversationStore({ storagePath });
		const key = first.create({
			conversationId: "upstream-private-conversation",
			parentMessageId: "upstream-private-message"
		});
		const second = new ConversationStore({ storagePath });
		assert.deepEqual(second.get(key), {
			conversationId: "upstream-private-conversation",
			parentMessageId: "upstream-private-message"
		});
		assert.equal(fs.statSync(storagePath).mode & 0o777, 0o600);
		assert.equal(second.delete(key), true);
		assert.equal(new ConversationStore({ storagePath }).get(key), null);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
