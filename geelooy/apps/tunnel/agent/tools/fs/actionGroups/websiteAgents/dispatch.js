//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Translates one accepted browser delivery into durable agent-working state.
 * @description
 * The Awtsmoos distinguishes dispatch from completion and remembers the thread born from one Send;
 * Awtsmoos.com stores its id and route so replacement Shluchim can inherit instead of starting again.
 */
function apply(current, agentId, round, continuation, result, event) {
	const target = current.agents.find(item => item.id === agentId);
	if (!target) return current;
	const acceptedAt = result.acceptedAt || new Date().toISOString();
	const conversationId = result.conversationId || result.conversationKey || null;
	target.conversationKey = conversationId;
	target.conversationId = conversationId;
	target.conversationUrl = result.conversationUrl || canonicalConversationUrl(conversationId);
	target.round = Math.max(target.round, Number(round || 0));
	target.continuationTurns += continuation ? 1 : 0;
	target.status = "dispatched";
	target.lastUpdate = "Prompt accepted; agent continues through filesystem and tunnel actions.";
	target.lastOutcome = receipt(result);
	target.error = null;
	target.submissionAcceptedAt = acceptedAt;
	target.pendingRound = null;
	current.events.push(event("agent_prompt_dispatched", {
		agentId,
		round,
		continuation,
		acceptedAt,
		conversationId,
		responseStatus: result.responseStatus,
		promptVerified: result.promptVerified === true,
		tabCloseVerified: result.tabClose?.verified === true
	}));
	return current;
}

function receipt(result = {}) {
	const conversationId = result.conversationId || result.conversationKey || null;
	return {
		complete: false,
		status: "DISPATCHED",
		next: "Agent continues independently through filesystem and tunnel actions.",
		files: [],
		roomMessage: "Prompt accepted. Await durable PLAN, PROGRESS, HANDOFF, and COMPLETION tool events.",
		findings: "No conversational answer was awaited or interpreted.",
		spawnRequests: [],
		spawnDiagnostics: [],
		hasStructuredStatus: true,
		answerPreview: "",
		dispatched: true,
		conversationId,
		conversationUrl: result.conversationUrl || canonicalConversationUrl(conversationId),
		acceptedAt: result.acceptedAt || null,
		responseStatus: result.responseStatus || null,
		promptVerified: result.promptVerified === true,
		tabCloseVerified: result.tabClose?.verified === true,
		tabClosedAt: result.tabClosedAt || null,
		submissionTransport: result.submissionTransport || null,
		requestLatencyMs: Number(result.requestLatencyMs || 0) || null
	};
}

function canonicalConversationUrl(conversationId) {
	return conversationId
		? `https://chatgpt.com/c/${encodeURIComponent(conversationId)}`
		: null;
}

function isTerminalForBrowser(agent = {}) {
	return ["dispatched", "complete", "failed", "waiting_for_login",
		"claim_conflict", "awaiting_recovery"].includes(agent.status);
}

function hasWorkingAgents(record = {}) {
	return (record.agents || []).some(agent => agent.status === "dispatched");
}

module.exports = { apply, hasWorkingAgents, isTerminalForBrowser, receipt };
