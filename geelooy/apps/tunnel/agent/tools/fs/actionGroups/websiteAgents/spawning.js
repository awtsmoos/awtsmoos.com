// B"H
const crypto = require("node:crypto");
const path = require("node:path");
const Store = require("./store.js");

function admit(missionId, parentAgentId, requests = []) {
	const result = { accepted: [], duplicates: [], rejected: [] };
	const updated = Store.update(missionId, record => {
		const parent = record.agents.find(agent => agent.id === parentAgentId);
		if (!parent) {
			result.rejected.push({ reason: "unknown_parent_agent" });
			return record;
		}
		const policy = record.plan?.subagentPolicy || {};
		const allowRecursive = policy.allowRecursiveSubagents !== false;
		const maxDepth = bounded(policy.maxSubagentDepth, 4, 1, 8);
		const maxChildren = bounded(
			policy.maxSubagentsPerAgent ?? policy.maxHelpersPerAgent,
			32,
			1,
			96
		);
		const maxTotal = bounded(policy.maxTotalWebsiteAgents, 256, 3, 512);
		record.spawnRegistry ||= {};
		record.spawnPayloadRegistry ||= {};
		parent.childAgentIds ||= [];

		for (const raw of requests) {
			const request = normalizeRequest(record.plan.projectRoot, raw);
			if (!request) {
				result.rejected.push({ reason: "invalid_spawn_request" });
				continue;
			}
			const registryKey = `${parent.id}:${request.key}`;
			const previous = record.spawnRegistry[registryKey];
			if (previous) {
				result.duplicates.push({
					requestKey: request.key,
					childAgentId: previous.childAgentId || null,
					status: previous.status
				});
				continue;
			}
			const payloadRegistryKey = stablePayloadKey(parent.id, request);
			const previousPayload = record.spawnPayloadRegistry[payloadRegistryKey];
			if (previousPayload) {
				record.spawnRegistry[registryKey] = {
					status: "duplicate_payload",
					parentAgentId: parent.id,
					childAgentId: previousPayload.childAgentId || null,
					requestKey: request.key,
					duplicateOfRequestKey: previousPayload.requestKey,
					at: now()
				};
				result.duplicates.push({
					requestKey: request.key,
					childAgentId: previousPayload.childAgentId || null,
					status: "duplicate_payload"
				});
				continue;
			}

			let reason = "";
			if (!allowRecursive) reason = "recursive_subagents_disabled";
			else if (parent.depth >= maxDepth) reason = "maximum_subagent_depth_reached";
			else if (parent.childAgentIds.length >= maxChildren) reason = "maximum_children_for_parent_reached";
			else if (record.agents.length >= maxTotal) reason = "maximum_total_website_agents_reached";
			if (reason) {
				record.spawnRegistry[registryKey] = {
					status: "rejected",
					reason,
					parentAgentId: parent.id,
					requestKey: request.key,
					at: now()
				};
				result.rejected.push({ requestKey: request.key, reason });
				record.events.push(event("subagent_spawn_rejected", {
					parentAgentId: parent.id,
					requestKey: request.key,
					reason
				}));
				continue;
			}

			const depth = parent.depth + 1;
			const childAgentId = stableChildId(record.id, parent.id, request.key, request.role, depth);
			const child = Store.agentState(record.id, {
				id: childAgentId,
				name: childName(request.role, depth, parent.childAgentIds.length + 1),
				role: request.role,
				focus: request.prompt,
				claimMode: "write",
				scope: request.scope,
				ordinal: record.agents.length + 1,
				parentAgentId: parent.id,
				depth,
				rootAgentId: parent.rootAgentId || parent.id,
				spawnRequestKey: request.key,
				assignmentPrompt: request.prompt,
				spawnPrompt: request.prompt,
				singleUse: true,
				childAgentIds: [],
				spawnedChildCount: 0,
				roomSeeded: false
			});
			record.agents.push(child);
			parent.childAgentIds.push(child.id);
			parent.spawnedChildCount = parent.childAgentIds.length;
			record.spawnRegistry[registryKey] = {
				status: "accepted",
				parentAgentId: parent.id,
				childAgentId: child.id,
				requestKey: request.key,
				request,
				at: now()
			};
			record.spawnPayloadRegistry[payloadRegistryKey] = {
				parentAgentId: parent.id,
				childAgentId: child.id,
				requestKey: request.key,
				at: now()
			};
			record.events.push(event("subagent_spawn_admitted", {
				parentAgentId: parent.id,
				childAgentId: child.id,
				requestKey: request.key,
				depth
			}));
			result.accepted.push({
				requestKey: request.key,
				parentAgentId: parent.id,
				childAgentId: child.id,
				depth,
				role: child.role,
				scope: child.scope,
				prompt: child.assignmentPrompt
			});
		}
		return record;
	});
	return { ...result, record: updated };
}

function stablePayloadKey(parentAgentId, request) {
	return crypto.createHash("sha256")
		.update([
			parentAgentId,
			request.role.toLowerCase(),
			request.scope.toLowerCase(),
			request.prompt.replace(/\s+/g, " ").trim().toLowerCase()
		].join("\0"))
		.digest("hex");
}

function normalizeRequest(projectRoot, raw = {}) {
	const key = String(raw.key || raw.requestId || "").trim().toLowerCase();
	const role = String(raw.role || "specialist").trim().slice(0, 80);
	const prompt = String(raw.prompt || "").trim().slice(0, 16000);
	const scope = normalizeScope(projectRoot, raw.scope);
	if (!/^[a-z0-9][a-z0-9._:-]{0,95}$/.test(key) || !role || !prompt || !scope) return null;
	return { key, requestId: key, role, scope, prompt };
}

function normalizeScope(projectRoot, raw) {
	const root = path.resolve(projectRoot || process.cwd());
	const value = String(raw || "").trim();
	if (!value || value.includes("\0")) return "";
	const absolute = path.resolve(root, value);
	const relative = path.relative(root, absolute);
	if (relative === ".." || relative.startsWith(`..${path.sep}`)) return "";
	return relative || ".";
}

function stableChildId(missionId, parentAgentId, requestKey, role, depth) {
	const digest = crypto.createHash("sha256")
		.update([missionId, parentAgentId, requestKey].join("\0"))
		.digest("hex")
		.slice(0, 12);
	const roleSlug = String(role || "specialist")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 24) || "specialist";
	return `website_d${depth}_${roleSlug}_${digest}`;
}

function childName(role, depth, ordinal) {
	return `Website ${String(role || "Specialist").trim()} D${depth}-${String(ordinal).padStart(2, "0")}`;
}

function pending(record = {}) {
	return (record.agents || []).filter(agent =>
		agent.parentAgentId && agent.roomSeeded !== false && agent.round === 0 &&
		!["submitting", "awaiting_recovery", "waiting_for_login", "failed", "claim_conflict"].includes(agent.status)
	);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function event(type, details = {}) {
	return { at: now(), type, ...details };
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	admit,
	normalizeRequest,
	normalizeScope,
	pending,
	stableChildId
};
