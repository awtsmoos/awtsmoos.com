// B"H
const H = require("./resourceHelpers.js");
/**
 * B"H — Every timer, socket, process, target, and claim must name its owner.
 * This ledger stores no raw handle, only evidence for cleanup and reconciliation.
 */
function createResourceLedger(options = {}) {
	const resources = new Map();
	const maxResources = H.positive(options.maxResources, 50000);
	function register(input = {}) {
		const resourceId = H.required(input.resourceId, "missing_resource_id");
		if (resources.has(resourceId)) throw H.failure("resource_exists");
		if (resources.size >= maxResources) evictCleaned();
		if (resources.size >= maxResources) throw H.failure("resource_ledger_full");
		if (!input.externallyManaged && !input.cleanupMethod) throw H.failure("missing_cleanup_method");
		const now = new Date().toISOString();
		const record = {
			resourceId,
			resourceType: H.required(input.resourceType, "missing_resource_type"),
			ownerType: H.required(input.ownerType, "missing_owner_type"),
			ownerId: H.required(input.ownerId, "missing_owner_id"),
			missionId: input.missionId || "",
			agentId: input.agentId || "",
			createdAt: now,
			lastHeartbeatAt: now,
			desiredState: input.desiredState || "running",
			observedState: input.observedState || "running",
			cleanupMethod: input.cleanupMethod || "externally-managed",
			cleanupDeadlineAt: input.cleanupDeadlineAt || null,
			externallyManaged: input.externallyManaged === true,
			cleanupAttempts: 0,
			lastCleanupError: null,
			revision: 0,
			metadata: H.sanitizeMetadata(input.metadata)
		};
		resources.set(resourceId, record);
		return H.clone(record);
	}
	function update(resourceId, patch, expectedRevision) {
		const current = requiredRecord(resourceId);
		if (expectedRevision !== undefined && current.revision !== expectedRevision) {
			throw H.failure("resource_revision_conflict", { currentRevision: current.revision });
		}
		const next = {
			...current,
			...patch,
			resourceId: current.resourceId,
			metadata: patch.metadata ? H.sanitizeMetadata(patch.metadata) : current.metadata,
			revision: current.revision + 1,
			updatedAt: new Date().toISOString()
		};
		resources.set(resourceId, next);
		return H.clone(next);
	}
	function heartbeat(resourceId, expectedRevision) {
		return update(resourceId, { lastHeartbeatAt: new Date().toISOString(), observedState: "running" }, expectedRevision);
	}
	function requestCleanup(resourceId, input = {}, expectedRevision) {
		return update(resourceId, {
			desiredState: "stopped",
			observedState: "cleanup-requested",
			cleanupDeadlineAt: input.cleanupDeadlineAt || new Date(Date.now() + H.positive(input.graceMs, 30000)).toISOString(),
			cleanupReason: input.reason || "owner_requested_cleanup"
		}, expectedRevision);
	}
	function completeCleanup(resourceId, input = {}, expectedRevision) {
		const current = requiredRecord(resourceId);
		return update(resourceId, {
			observedState: input.ok === false ? "cleanup-failed" : "cleaned",
			cleanupAttempts: current.cleanupAttempts + 1,
			lastCleanupError: input.ok === false ? input.error || "cleanup_failed" : null,
			cleanedAt: input.ok === false ? null : new Date().toISOString()
		}, expectedRevision);
	}
	function stale(now = Date.now(), staleAfterMs = 60000) {
		return [...resources.values()].filter(record => {
			if (["cleaned", "externally-managed"].includes(record.observedState)) return false;
			return now - Date.parse(record.lastHeartbeatAt || record.createdAt) > staleAfterMs;
		}).map(H.clone);
	}
	function snapshot() {
		const records = [...resources.values()];
		return {
			total: records.length,
			active: records.filter(record => record.observedState !== "cleaned").length,
			cleanupFailed: records.filter(record => record.observedState === "cleanup-failed").length,
			byType: H.countBy(records, "resourceType"),
			byOwnerType: H.countBy(records, "ownerType"),
			maxResources
		};
	}
	function get(resourceId) {
		const record = resources.get(resourceId);
		return record ? H.clone(record) : null;
	}
	function evictCleaned() {
		for (const [resourceId, record] of resources) {
			if (record.observedState === "cleaned") return resources.delete(resourceId);
		}
		return false;
	}
	function requiredRecord(resourceId) {
		const record = resources.get(resourceId);
		if (!record) throw H.failure("resource_not_found");
		return record;
	}
	return { completeCleanup, get, heartbeat, register, requestCleanup, snapshot, stale, update };
}
module.exports = { createResourceLedger, sanitizeMetadata: H.sanitizeMetadata };
