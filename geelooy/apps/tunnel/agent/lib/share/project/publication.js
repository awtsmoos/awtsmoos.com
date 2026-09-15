//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");

/**
 * @file Publishes immutable sanitized references to exact workspace snapshots.
 * @description The Awtsmoos can reveal lineage without exposing private speech; Awtsmoos.com
 * publishes hashes, counts, source descriptors, and explicit public metadata—not Room/chat/session data.
 */
function sanitize(snapshot = {}, input = {}) {
	return {
		version: 1,
		projectId: snapshot.projectId || "",
		snapshotId: snapshot.id,
		snapshotHash: snapshot.hash,
		mission: snapshot.mission ? {
			id: snapshot.mission.id,
			status: snapshot.mission.status || ""
		} : null,
		counts: {
			work: snapshot.work?.length || 0,
			knowledge: snapshot.knowledge?.length || 0,
			obligations: snapshot.obligations?.length || 0,
			sources: snapshot.compiler?.sources?.length || 0
		},
		compiler: snapshot.compiler ? {
			version: snapshot.compiler.version,
			hash: snapshot.compiler.hash,
			watermark: snapshot.compiler.watermark,
			sources: (snapshot.compiler.sources || []).map(source => ({
				id: source.id,
				type: source.type,
				contentHash: source.contentHash,
				version: source.version,
				sequence: source.sequence
			}))
		} : null,
		publicMetadata: input.publicMetadata && typeof input.publicMetadata === "object"
			? input.publicMetadata
			: {}
	};
}

async function create(config, input = {}) {
	const snapshotId = String(input.snapshotId || input.workspaceSnapshotId || "");
	const snapshot = await Store.get(config, "snapshots", snapshotId);
	if (!snapshot) throw new Error("publication_snapshot_not_found");
	return Store.put(config, "publications", sanitize(snapshot, input), {
		createdAt: new Date().toISOString()
	});
}

module.exports = { create, sanitize };
