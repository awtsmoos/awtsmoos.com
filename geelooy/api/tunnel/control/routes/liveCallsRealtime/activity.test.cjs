// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const { publishLiveCallActivity } = require("./activity.js");

test("publishes only bounded live-call metadata", () => {
	const published = [];
	const secret = "secret prompt and agent response";
	const result = publishLiveCallActivity({
		ws: { publishActivity: event => (published.push(event), event) }
	}, {
		accountId: "account-a",
		userId: "user-a",
		sessionId: "session-a"
	}, "live_call.snapshot", {
		state: "updated",
		conversationId: "conversation-a",
		sequence: 7,
		changeCount: 2,
		activeCount: 1,
		content: secret,
		messages: [{ content: secret }],
		summary: "x".repeat(400)
	});
	assert.equal(result, published[0]);
	assert.equal(result.accountId, "account-a");
	assert.equal(result.detail.conversationId, "conversation-a");
	assert.equal(result.detail.sequence, 7);
	assert.equal(result.summary.length, 240);
	assert.equal(JSON.stringify(result).includes(secret), false);
});

test("is a safe no-op without an authenticated account or publisher", () => {
	assert.equal(publishLiveCallActivity({}, {}, "live_call.snapshot"), null);
	assert.equal(publishLiveCallActivity({ ws: {} }, { accountId: "a" }, "live_call.snapshot"), null);
});

test("the complete control route graph loads", () => {
	assert.doesNotThrow(() => require("../../_awtsmoos.derech.js"));
});
