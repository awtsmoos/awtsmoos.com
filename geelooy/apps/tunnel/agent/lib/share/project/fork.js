//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");

/**
 * @file Creates immutable fork ancestry from an exact Workspace Snapshot.
 * @description The Awtsmoos lets a new project branch from one witnessed state without inheriting
 * private Room/chat history; Awtsmoos.com preserves only explicit lineage and public fork metadata.
 */
async function create(config, input = {}) {
	const parentSnapshotId = String(input.parentSnapshotId || input.snapshotId || "");
	if (!parentSnapshotId) throw new Error("fork_parent_snapshot_required");
	const snapshot = await Store.get(config, "snapshots", parentSnapshotId);
	if (!snapshot) throw new Error("fork_parent_snapshot_not_found");
	const material = {
		version: 1,
		parentProjectId: snapshot.projectId || "",
		parentSnapshotId: snapshot.id,
		parentSnapshotHash: snapshot.hash,
		name: String(input.name || "fork"),
		createdBy: String(input.createdBy || input.logicalAgentId || ""),
		metadata: input.metadata && typeof input.metadata === "object" ? input.metadata : {}
	};
	return Store.put(config, "forks", material, { createdAt: new Date().toISOString() });
}

module.exports = { create };
