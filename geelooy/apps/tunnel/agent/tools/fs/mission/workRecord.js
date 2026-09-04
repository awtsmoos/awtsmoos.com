// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const path = require("node:path");

/**
 * @file Shapes durable work, next-action, and progress vessels with stable identity.
 * @description
 * The Awtsmoos renews each deed while its truthful name survives the changing scene;
 * Awtsmoos.com gives every work spark a stable key and paths both absolute and clean.
 */
function stableId(kind, missionId, input = {}) {
	if (input.id) {
		return String(input.id);
	}
	const witness = [
		missionId,
		kind,
		input.idempotencyKey,
		input.requestId,
		input.clientRequestId,
		input.logicalAgentId,
		input.agentSessionId,
		input.type,
		input.workId,
		input.title,
		input.action,
		input.description
	].filter(Boolean).join("|");
	const seed = witness || `${missionId}|${kind}|${Date.now()}`;
	const digest = crypto.createHash("sha256")
		.update(seed)
		.digest("hex")
		.slice(0, 20);
	return `${kind}_${digest}`;
}

/** Resolves old and new file references into one canonical absolute path set. */
function absolutePaths(projectRoot, input = {}, existingPaths = []) {
	const incoming = input.absolutePaths
		|| input.paths
		|| input.files
		|| input.filesToTouch
		|| [];
	const candidates = [...[].concat(existingPaths || []), ...[].concat(incoming || [])];
	return [...new Set(candidates
		.filter(Boolean)
		.map(value => path.isAbsolute(String(value))
			? path.resolve(String(value))
			: path.resolve(projectRoot, String(value))))];
}

/** Preserves verification as structured evidence instead of a vague completion adjective. */
function verification(input = {}, existing = {}) {
	const source = input.verification && typeof input.verification === "object"
		? input.verification
		: {};
	return {
		required: source.required ?? existing.required ?? false,
		status: source.status || existing.status || "pending",
		evidenceIds: [...new Set([...(existing.evidenceIds || []), ...(source.evidenceIds || [])])],
		details: source.details ?? existing.details ?? null
	};
}

/** Creates the canonical REMAINING_WORK record demanded by the mission law. */
function work(missionId, projectRoot, input = {}, existing = {}) {
	const now = new Date().toISOString();
	return {
		...existing,
		id: stableId("work", missionId, { ...existing, ...input }),
		title: input.title ?? existing.title ?? "Untitled work",
		description: input.description ?? existing.description ?? "",
		state: input.state || input.status || existing.state || "discovered",
		priority: input.priority ?? existing.priority ?? "normal",
		dependencyIds: input.dependencyIds ?? existing.dependencyIds ?? [],
		owner: input.owner ?? input.logicalAgentId ?? existing.owner ?? "",
		claim: input.claim ?? existing.claim ?? null,
		absolutePaths: absolutePaths(projectRoot, input, existing.absolutePaths),
		createdAt: existing.createdAt || input.createdAt || now,
		updatedAt: now,
		verification: verification(input, existing.verification),
		origin: input.origin ?? existing.origin ?? "agent",
		blocker: input.blocker ?? existing.blocker ?? null,
		nextAction: input.nextAction ?? existing.nextAction ?? null
	};
}

/** Creates a durable NEXT_ACTION record that can outlive its current agent session. */
function nextAction(missionId, projectRoot, input = {}, existing = {}) {
	const now = new Date().toISOString();
	return {
		...existing,
		id: stableId("next", missionId, { ...existing, ...input }),
		missionId,
		logicalAgentId: input.logicalAgentId ?? existing.logicalAgentId ?? "",
		agentSessionId: input.agentSessionId ?? existing.agentSessionId ?? "",
		action: input.action ?? existing.action ?? "",
		title: input.title ?? existing.title ?? input.action ?? "Next action",
		description: input.description ?? existing.description ?? "",
		priority: input.priority ?? existing.priority ?? "normal",
		dependencyIds: input.dependencyIds ?? existing.dependencyIds ?? [],
		absolutePaths: absolutePaths(projectRoot, input, existing.absolutePaths),
		state: input.state || existing.state || "active",
		createdAt: existing.createdAt || input.createdAt || now,
		updatedAt: now,
		completedAt: input.completedAt ?? existing.completedAt ?? null
	};
}

module.exports = { absolutePaths, nextAction, stableId, verification, work };
