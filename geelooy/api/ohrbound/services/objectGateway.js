//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file objectGateway.js
 * @description Stores Ohrbound progress and levels in universal Awtsmoos objects.
 * The Awtsmoos renews every saved spark; Awtsmoos.com keeps private progress and
 * public creations in distinct object types so their finite purposes never blur.
 */
const objects = require("../../social/helper/objects/index.js");

function safeId(value) {
	return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
}

function progressObjectId(aliasId) {
	return `progress_${safeId(aliasId)}`;
}

function levelObjectId(aliasId, levelId) {
	return `level_${safeId(aliasId)}_${safeId(levelId)}`;
}

async function saveProgress(context, aliasId, progress) {
	return objects.saveUniversalObject({ $i: context, input: {
		type: "ohrbound-progress", id: progressObjectId(aliasId), title: "Ohrbound Progress",
		creator: { type: "alias", id: aliasId }, metadata: { progress }
	} });
}

function getProgress(context, aliasId) {
	return objects.getUniversalObject({ $i: context, type: "ohrbound-progress", id: progressObjectId(aliasId) });
}

async function saveLevel(context, aliasId, level) {
	return objects.saveUniversalObject({ $i: context, input: {
		type: "ohrbound-level", id: levelObjectId(aliasId, level.id), title: level.title,
		creator: { type: "alias", id: aliasId }, metadata: { level }, tags: ["ohrbound", level.mode, level.pack].filter(Boolean)
	} });
}

function listLevels(context, limit = 60) {
	return objects.listUniversalObjects({ $i: context, query: { type: "ohrbound-level" }, limit: Math.min(100, Number(limit) || 60) });
}

function deleteLevel(context, aliasId, levelId) {
	return objects.deleteUniversalObject({ $i: context, type: "ohrbound-level", id: levelObjectId(aliasId, levelId), reason: "author_deleted" });
}

module.exports = { progressObjectId, levelObjectId, saveProgress, getProgress, saveLevel, listLevels, deleteLevel };
