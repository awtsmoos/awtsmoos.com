//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Activity is not invented ornament. The Awtsmoos renews every command and
 * every file touch from nothing; Awtsmoos.com summarizes only stored actions
 * that the tunnel actually returned, preserving evidence over simulated glow.
 */

/** Builds the scope sent to action-history queries. */
function scopedPayload(options = {}) {
	const values = {
		missionId: options.missionId,
		conversationId: options.conversationId,
		conversationName: options.conversationName,
		agentSessionId: options.agentSessionId,
		logicalAgentId: options.logicalAgentId,
		clientRequestId: options.clientRequestId,
		tunnelName: options.tunnelName
	};

	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => Boolean(value))
	);
}

/** Summarizes real room activity for the existing dashboard contract. */
function summarizeRoomOs(history = [], timeline = [], status = {}) {
	const buckets = {
		command: 0,
		filesystem: 0,
		browser: 0,
		mission: 0,
		failed: 0,
		other: 0
	};

	for (const entry of history) {
		buckets[classify(entry)] += 1;
		if (entry?.ok === false) {
			buckets.failed += 1;
		}
	}

	return {
		metrics: {
			actions: history.length,
			timeline: timeline.length,
			agents: countAgents(status),
			...buckets
		},
		recentActions: history.slice(0, 30).map(compactAction),
		source: history.length ? "scoped-action-history" : "mission-timeline"
	};
}

/** Classifies one stored action without claiming more than its name proves. */
function classify(entry = {}) {
	const action = String(entry.action || "");

	if (/^(command|shellCommand|commandRun|commandStart|node|npm|test|build)/.test(action)) {
		return "command";
	}
	if (/^(read|write|bulkWrite|move|copy|delete|mkdir|ensureFile|touch|applyPatch|replace)/.test(action)) {
		return "filesystem";
	}
	if (/^(chrome|browser|remoteDesktop|http|network)/.test(action)) {
		return "browser";
	}
	if (/^mission/.test(action)) {
		return "mission";
	}
	return "other";
}

function countAgents(status = {}) {
	const collaboration = status.collaboration
		|| status.mission?.collaboration
		|| status.status?.collaboration;
	const agents = collaboration?.agents
		|| collaboration?.room?.agents
		|| collaboration?.participants
		|| [];

	return Array.isArray(agents) ? agents.length : Object.keys(agents).length;
}

function compactAction(entry = {}) {
	const input = entry.input || {};

	return {
		actionId: entry.actionId,
		action: entry.action,
		group: classify(entry),
		ok: entry.ok !== false,
		createdAt: entry.createdAt,
		missionId: entry.missionId || input.missionId || null,
		conversationId: entry.conversationId || input.conversationId || null,
		agentSessionId: entry.agentSessionId || input.agentSessionId || null,
		logicalAgentId: entry.logicalAgentId || input.logicalAgentId || null,
		path: input.path || input.p || input.cwd || input.url || null,
		parentActionId: entry.parentActionId || null,
		outputRef: entry.outputRef || null
	};
}

module.exports = {
	classify,
	compactAction,
	scopedPayload,
	summarizeRoomOs
};
