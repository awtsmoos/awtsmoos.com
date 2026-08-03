// B"H
const assert = require("node:assert/strict");
const Outcome = require("../tools/fs/actionGroups/websiteAgents/outcome.js");
const Prompt = require("../tools/fs/actionGroups/websiteAgents/prompt.js");

function answerWith(requests, room = defaultRoom()) {
	return [
		"STATUS",
		"UNFINISHED",
		"FINDINGS",
		"Independent work was identified.",
		"FILES",
		"geelooy/apps/tunnel/agent",
		"MESSAGE TO ROOM",
		room,
		"SPAWN",
		"```json",
		JSON.stringify(requests, null, 2),
		"```",
		"NEXT",
		"Collect child handoffs from the shared mission room."
	].join("\n");
}

function request(index, overrides = {}) {
	return {
		requestId: `child.${String(index).padStart(2, "0")}`,
		role: `specialist ${index}`,
		scope: `geelooy/area-${index}`,
		prompt: `Inspect area ${index}, perform its independent bounded task, verify it, and publish a durable handoff.`,
		...overrides
	};
}

function defaultRoom() {
	return [
		"PLAN: split independent scopes and preserve request identities.",
		"PROGRESS: source inspection complete; child work is ready.",
		"HANDOFF: use the exact child scopes and collect their evidence.",
		"COMPLETION: pending child verification."
	].join("\n");
}

function acceptsDozensWithStableShape() {
	const result = Outcome.analyze(answerWith(
		Array.from({ length: 96 }, (_, index) => request(index + 1))
	));
	assert.equal(result.spawnRequests.length, 96);
	assert.equal(result.spawnDiagnostics.length, 0);
	assert.deepEqual(result.spawnRequests[0], {
		key: "child.01",
		requestId: "child.01",
		role: "specialist 1",
		scope: "geelooy/area-1",
		prompt: "Inspect area 1, perform its independent bounded task, verify it, and publish a durable handoff."
	});
	assert.equal(new Set(result.spawnRequests.map(item => item.requestId)).size, 96);
	assert.equal(result.roomUpdate.plan, "split independent scopes and preserve request identities.");
	assert.equal(result.roomUpdate.progress, "source inspection complete; child work is ready.");
	assert.equal(result.roomUpdate.handoff, "use the exact child scopes and collect their evidence.");
	assert.equal(result.roomUpdate.completion, "pending child verification.");
	assert.equal(result.roomUpdate.complete, false);
}

function rejectsMalformedAndUnsafeRequests() {
	const malformed = Outcome.analyze(answerWith([]).replace("[]", "[{broken]"));
	assert.deepEqual(malformed.spawnRequests, []);
	assert.equal(malformed.spawnDiagnostics[0].code, "invalid_spawn_json");

	const candidates = [
		null,
		request(1, { requestId: "UPPERCASE" }),
		request(2, { role: "bad\nrole" }),
		request(3, { scope: "../outside" }),
		request(4, { scope: "/absolute/path" }),
		request(5, { prompt: "" }),
		{ ...request(6), hiddenInstruction: "must be rejected" },
		request(7)
	];
	const result = Outcome.analyze(answerWith(candidates));
	assert.deepEqual(result.spawnRequests.map(item => item.requestId), ["child.07"]);
	assert.deepEqual(result.spawnDiagnostics.map(item => item.code), [
		"spawn_request_must_be_object",
		"invalid_spawn_request_id",
		"invalid_spawn_role",
		"invalid_spawn_scope",
		"invalid_spawn_scope",
		"invalid_spawn_prompt",
		"unexpected_spawn_request_field"
	]);
}

function acceptsLegacyHeadingButRejectsAmbiguousDoubleSection() {
	const legacy = Outcome.analyze(answerWith([request(1)]).replace("SPAWN", "SUBAGENT REQUESTS"));
	assert.deepEqual(legacy.spawnRequests.map(item => item.requestId), ["child.01"]);
	const ambiguous = Outcome.analyze([
		answerWith([request(1)]),
		"SUBAGENT REQUESTS",
		JSON.stringify([request(2)])
	].join("\n"));
	assert.deepEqual(ambiguous.spawnRequests, []);
	assert.equal(ambiguous.spawnDiagnostics[0].code, "multiple_spawn_sections");
}

function truncatesOversizedPromptsWithoutLeakingExtraFields() {
	const result = Outcome.analyze(answerWith([
		request(1, { prompt: "x".repeat(17000) }),
		{ ...request(2), continuationKey: "private-value-must-not-pass" }
	]));
	assert.equal(result.spawnRequests.length, 1);
	assert.equal(result.spawnRequests[0].prompt.length, 16000);
	assert.deepEqual(Object.keys(result.spawnRequests[0]), [
		"key", "requestId", "role", "scope", "prompt"
	]);
	assert.ok(!JSON.stringify(result.spawnRequests).includes("private-value-must-not-pass"));
	assert.deepEqual(result.spawnDiagnostics.map(item => item.code), [
		"spawn_prompt_truncated",
		"unexpected_spawn_request_field"
	]);
}

function deduplicatesAndEnforcesCallerLimit() {
	const samePayload = request(4, { requestId: "different.id" });
	const result = Outcome.analyze(answerWith([
		request(1),
		request(1, { prompt: "A conflicting replay must not execute." }),
		request(2),
		request(3),
		request(4),
		samePayload,
		request(5)
	]), { maxSpawnRequests: 3 });
	assert.deepEqual(result.spawnRequests.map(item => item.requestId), [
		"child.01",
		"child.02",
		"child.03"
	]);
	assert.ok(result.spawnDiagnostics.some(item =>
		item.code === "duplicate_spawn_request_id" && item.requestId === "child.01"
	));
	assert.ok(result.spawnDiagnostics.some(item =>
		item.code === "spawn_request_limit_exceeded" && item.limit === 3
	));
	assert.ok(result.spawnDiagnostics.some(item =>
		item.code === "duplicate_spawn_request_payload" && item.requestId === "different.id"
	));

	const payloadDuplicate = Outcome.analyze(answerWith([
		request(7),
		request(7, { requestId: "same.work" })
	]));
	assert.equal(payloadDuplicate.spawnRequests.length, 1);
	assert.equal(payloadDuplicate.spawnDiagnostics[0].code, "duplicate_spawn_request_payload");
}

function boundsHostileExcessInput() {
	const result = Outcome.analyze(answerWith(
		Array.from({ length: 300 }, (_, index) => request(index + 1))
	));
	assert.equal(result.spawnRequests.length, 96);
	assert.ok(result.spawnDiagnostics.length <= 257);
	assert.ok(result.spawnDiagnostics.some(item =>
		item.code === "spawn_input_items_truncated" && item.received === 300
	));
	assert.ok(result.spawnDiagnostics.some(item =>
		item.code === "spawn_request_limit_exceeded" && item.limit === 96
	));
	const objectInsteadOfArray = Outcome.parseSpawnRequests(JSON.stringify({
		requests: [request(1)]
	}));
	assert.deepEqual(objectInsteadOfArray.requests, []);
	assert.equal(objectInsteadOfArray.diagnostics[0].code, "spawn_requests_must_be_array");
}

function recognizesVerifiedDurableCompletion() {
	const result = Outcome.analyze(answerWith([], [
		"PLAN: inspect first.",
		"PROGRESS: all bounded work and tests finished.",
		"HANDOFF: evidence is in test/output.json.",
		"COMPLETION: verified and passed."
	].join("\n")).replace("UNFINISHED", "COMPLETE").replace(
		"Collect child handoffs from the shared mission room.",
		"none"
	));
	assert.equal(result.complete, true);
	assert.equal(result.roomUpdate.complete, true);
	assert.deepEqual(result.spawnRequests, []);
}

function promptPublishesTheExactContract() {
	const text = Prompt.firstTurn({
		missionId: "mission_recursive_contract",
		goal: "Complete a large repository task.",
		plan: {
			projectRoot: "/tmp/repository",
			customGptName: "Awtsmoos Shliach",
			subagentPolicy: {
				priority: "required-when-available",
				mode: "bounded-single-use",
				maxHelpersPerAgent: 12
			}
		}
	}, {
		name: "Website Runtime 01",
		ordinal: 1,
		agentSessionId: "agent-session-1",
		parentAgentId: "website_00_architect",
		depth: 2,
		assignmentPrompt: "Audit only recursive scheduling receipts and return exact test evidence.",
		scope: "geelooy/apps/tunnel/agent",
		role: "runtime",
		focus: "recursive child scheduling"
	}, { agents: [], messages: [], activeClaims: [], openDelegations: [] });
	assert.match(text, /SPAWN must be exactly one JSON array/);
	assert.match(text, /requestId, role, scope, and prompt/);
	assert.match(text, /executed by the tunnel as real website child agents/);
	assert.match(text, /tunnel owns idempotency, depth\/count limits, pacing/);
	assert.match(text, /A child may request its own independent children/);
	assert.match(text, /Parent website agent: website_00_architect\. Recursive depth: 2/);
	assert.match(text, /Exact child assignment: Audit only recursive scheduling receipts/);
	assert.match(text, /PLAN, PROGRESS, HANDOFF, and COMPLETION/);
}

acceptsDozensWithStableShape();
rejectsMalformedAndUnsafeRequests();
acceptsLegacyHeadingButRejectsAmbiguousDoubleSection();
truncatesOversizedPromptsWithoutLeakingExtraFields();
deduplicatesAndEnforcesCallerLimit();
boundsHostileExcessInput();
recognizesVerifiedDurableCompletion();
promptPublishesTheExactContract();

console.log(JSON.stringify({
	ok: true,
	suite: "website-agent-recursive-contract",
	checks: [
		"96-child structured contract",
		"malformed request rejection",
		"legacy heading compatibility and ambiguous-section rejection",
		"path and field validation",
		"prompt truncation and private-field exclusion",
		"id and payload deduplication",
		"caller count cap",
		"hostile excess-input bound",
		"durable room progress/handoff/completion",
		"recursive prompt contract"
	]
}, null, 2));
