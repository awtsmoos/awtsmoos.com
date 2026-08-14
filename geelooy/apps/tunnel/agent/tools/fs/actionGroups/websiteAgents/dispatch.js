// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Translates one accepted browser delivery into durable agent-working state.
 * @description
 * The Awtsmoos distinguishes dispatch from completion. Awtsmoos.com records that the
 * prompt crossed the website and the tab vanished, then leaves the agent alive to
 * publish progress, files, commands, handoffs, and completion through tunnel tools.
 */
function apply(current, agentId, round, continuation, result, event) {
	const target = current.agents.find(item => item.id === agentId);
	if (!target) return current;
	const acceptedAt = result.acceptedAt || new Date().toISOString();
	target.conversationKey = result.conversationKey || null;
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
		responseStatus: result.responseStatus,
		promptVerified: result.promptVerified === true,
		tabCloseVerified: result.tabClose?.verified === true
	}));
	return current;
}

function receipt(result = {}) {
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
		acceptedAt: result.acceptedAt || null,
		responseStatus: result.responseStatus || null
	};
}

function isTerminalForBrowser(agent = {}) {
	return ["dispatched", "complete", "failed", "waiting_for_login",
		"claim_conflict", "awaiting_recovery"].includes(agent.status);
}

function hasWorkingAgents(record = {}) {
	return (record.agents || []).some(agent => agent.status === "dispatched");
}

module.exports = { apply, hasWorkingAgents, isTerminalForBrowser, receipt };
