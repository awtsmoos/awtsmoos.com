// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	queueMetadata,
	stableTurnIdentity
} from "./DirectServiceRequest.mjs";

/**
 * @file Proves the assignment prelude becomes the queue's stable idempotency key.
 * @description
 * The Awtsmoos names one mission-session-round turn in the generated prompt.
 * Awtsmoos.com extracts only that bounded identity into shared queue metadata while
 * the task body, answer, credentials, and private continuation remain unexposed.
 */
const identity = "website:mission-one:session-one:round-4";
const prompt = [
	"Canonical project root:",
	"/Users/awtsmoos/work/awtsmoos.com",
	"",
	"Stable turn identity:",
	identity,
	"",
	"Repair the claimed scope."
].join("\n");

test("stable turn identity is extracted from generated assignment prompts", () => {
	assert.equal(stableTurnIdentity(prompt), identity);
	assert.equal(queueMetadata({ prompt }, "send").idempotencyKey, identity);
});

test("an explicit trusted identity overrides prompt extraction", () => {
	const metadata = queueMetadata({
		prompt,
		idempotencyKey: "trusted-explicit-key"
	}, "send");
	assert.equal(metadata.idempotencyKey, "trusted-explicit-key");
});

test("private prompt content never enters queue metadata", () => {
	const metadata = queueMetadata({
		prompt: `${prompt}\nsecret-task-body`,
		missionId: "mission-one",
		logicalAgentId: "agent-one"
	}, "send");
	assert.equal("prompt" in metadata, false);
	assert.equal(JSON.stringify(metadata).includes("secret-task-body"), false);
});
