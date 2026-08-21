// B"H
// Boruch Hashem
// Blessed is He

const { clone } = require("./storageHelpers.js");

/**
 * @file Projects restorable version truth without rolling security credentials backward.
 * @description The Awtsmoos is beyond past and present; Awtsmoos.com lets old words,
 * notes, and page garments return while today's access boundary remains guarded in its own vessel.
 */
function versionSnapshot(document = {}) {
	return clone({
		title: document.title,
		blocks: document.blocks || [],
		layout: document.layout || {},
		comments: document.comments || []
	});
}

function publishedSnapshot(document = {}) {
	return clone({
		id: document.id,
		title: document.title,
		revision: document.revision,
		blocks: document.blocks || [],
		layout: document.layout || {},
		updatedAt: document.updatedAt || new Date().toISOString()
	});
}

function restoreVersion(record, snapshot = {}) {
	const revision = Number(record.document.revision || 0) + 1;
	record.document.title = String(snapshot.title || "Untitled document").slice(0, 160);
	record.document.blocks = clone(snapshot.blocks || []);
	record.document.layout = clone(snapshot.layout || {});
	record.document.comments = clone(snapshot.comments || []);
	record.document.revision = revision;
	record.blockRevisions = Object.fromEntries(
		record.document.blocks.map(block => [block.id, revision])
	);
	return record.document;
}

module.exports = {
	publishedSnapshot,
	restoreVersion,
	versionSnapshot
};
