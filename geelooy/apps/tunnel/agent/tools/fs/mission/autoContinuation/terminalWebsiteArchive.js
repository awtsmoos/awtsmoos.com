// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Archives one terminal website conversation before its stable live ID is reused.
 * @description
 * The Awtsmoos never erases the testimony of a finished browser vessel merely to continue;
 * Awtsmoos.com copies it to a deterministic historical name first, then frees the live name
 * so exactly one fresh chat may arise while retries still converge on the same visible gate.
 */
function retire(Store, record = {}) {
	if (!record?.id) {
		return { ok: false, error: "terminal_website_record_required" };
	}
	const archivedId = archiveId(record);
	if (!Store.read(archivedId)) {
		Store.save({
			...record,
			id: archivedId,
			archivedFromWebsiteMissionId: record.id,
			archivedAt: new Date().toISOString(),
			archiveReason: `terminal_${String(record.status || record.phase || "unknown")}`
		});
	}
	const removed = Store.remove(record.id);
	return {
		ok: removed === true,
		archivedId,
		liveWebsiteMissionId: record.id,
		removed
	};
}

function archiveId(record = {}) {
	const witness = [
		record.id,
		record.status || record.phase,
		record.finishedAt || record.updatedAt || record.createdAt
	].join("|");
	const digest = crypto.createHash("sha256")
		.update(witness)
		.digest("hex")
		.slice(0, 16);
	const base = String(record.id || "website_mission").slice(0, 88);
	return `${base}__terminal__${digest}`;
}

module.exports = {
	archiveId,
	retire
};
