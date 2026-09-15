//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Actions = require("../../actions.js");
const Knowledge = require("../../workGraph/knowledgeStore.js");
const Obligations = require("../../workGraph/obligationStore.js");
const Sessions = require("../../mission/agentSessionStore.js");

/**
 * @file Exercises the Release B knowledge and obligation story through public actions.
 * @description The Awtsmoos lets claims survive correction and duty survive sessions;
 * Awtsmoos.com proves the whole passage without crowding one test vessel past its bounds.
 */
function api(config, payload) {
	return Actions.buildActions(config, { ...payload, normalized: true }, null);
}

async function publish(config, values) {
	return api(config, {
		action: "agentKnowledgePublish",
		...values
	}).agentKnowledgePublish();
}

async function proveKnowledge(config) {
	const first = await publish(config, {
		kind: "decision",
		messageId: "room-message-1",
		statement: "Use the Chronicle as permanent causal history.",
		logicalAgentId: "agent:alpha"
	});
	const retry = await publish(config, {
		kind: "decision",
		messageId: "room-message-1",
		statement: first.assertion.statement,
		logicalAgentId: "agent:alpha"
	});
	assert.equal(retry.assertion.id, first.assertion.id);
	assert.equal((await Knowledge.all(config)).length, 1);
	const newer = await publish(config, {
		kind: "decision",
		statement: "Compile context from Chronicle and published knowledge.",
		logicalAgentId: "agent:alpha"
	});
	await api(config, {
		action: "agentKnowledgeRelate",
		type: "supersedes",
		from: newer.assertion.id,
		to: first.assertion.id
	}).agentKnowledgeRelate();
	await api(config, {
		action: "agentKnowledgeRelate",
		type: "contradicts",
		from: first.assertion.id,
		to: newer.assertion.id
	}).agentKnowledgeRelate();
	const current = await api(config, {
		action: "agentKnowledgeSearch",
		kind: "decision",
		currentOnly: true,
		logicalAgentId: "agent:alpha"
	}).agentKnowledgeSearch();
	assert.deepEqual(current.assertions.map(item => item.id), [newer.assertion.id]);
	assert.equal(current.relations.some(item => item.type === "contradicts"), true);
	await publish(config, {
		kind: "failure",
		statement: "A failed approach remains useful evidence.",
		logicalAgentId: "agent:alpha"
	});
	const secret = await publish(config, {
		kind: "handoff",
		statement: "Only agent beta may see this handoff.",
		logicalAgentId: "agent:alpha",
		audience: { mode: "agents", agents: ["agent:beta"] }
	});
	const hidden = await api(config, {
		action: "agentKnowledgeSearch",
		logicalAgentId: "agent:gamma"
	}).agentKnowledgeSearch();
	assert.equal(hidden.assertions.some(item => item.id === secret.assertion.id), false);
	const visible = await api(config, {
		action: "agentKnowledgeSearch",
		logicalAgentId: "agent:beta"
	}).agentKnowledgeSearch();
	assert.equal(visible.assertions.some(item => item.id === secret.assertion.id), true);
}

async function proveObligations(config) {
	const created = await api(config, {
		action: "agentObligationCreate",
		title: "Finish verifier",
		body: "Carry this work into replacement",
		logicalAgentId: "agent:alpha",
		agentSessionId: "session_a"
	}).agentObligationCreate();
	const replacement = {
		id: "session_b",
		logicalAgentId: "agent:alpha",
		role: "worker",
		status: "active",
		replacementOf: "session_a",
		startedAt: "2026-09-15T00:00:00.000Z"
	};
	await Sessions.save(config, replacement);
	await Sessions.save(config, { ...replacement, lastSeenAt: "later" });
	const transitions = (await Obligations.all(config)).filter(item => {
		return item.obligationId === created.obligation.obligationId;
	});
	assert.equal(transitions.length, 2);
	const open = await Obligations.current(config, {
		logicalAgentId: "agent:alpha",
		state: "open"
	});
	assert.equal(open[0].agentSessionId, "session_b");
	assert.equal(open[0].inheritedFromSessionId, "session_a");
}

module.exports = { proveKnowledge, proveObligations };
