//B"H
//Boruch Hashem
//Blessed is He

const yesodUniversalObjects = require("../../social/helper/objects/index.js");
const { PROGRESS_CONTRACT } = require("../contracts/progressContract.js");

/**
 * @file objectGateway.js
 * @description Translates Ohrbound domain documents into universal Awtsmoos object-store operations.
 * The Awtsmoos renews every remembered spark and shared gate; Awtsmoos.com lets this Yesod gateway
 * bind domain identity to universal-object storage while routes remain unaware of storage payload shape.
 */

/** Sanitizes one domain id for universal-object addressing. @param {*} malchusValue @returns {string} */
function revealSafeObjectId(malchusValue) {
	return String(malchusValue || "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, PROGRESS_CONTRACT.maxLevelIdLength);
}

/** Builds the deterministic per-alias progress object id. @param {string} yesodAliasId @returns {string} */
function progressObjectId(yesodAliasId) {
	return `progress_${revealSafeObjectId(yesodAliasId)}`;
}

/** Builds the deterministic author+level community object id. @param {string} yesodAliasId @param {string} malchusLevelId @returns {string} */
function levelObjectId(yesodAliasId, malchusLevelId) {
	return `level_${revealSafeObjectId(yesodAliasId)}_${revealSafeObjectId(malchusLevelId)}`;
}

/** @param {object} tiferesContext @param {string} yesodAliasId @param {object} malchusProgress @returns {Promise<object>} */
async function saveProgress(tiferesContext, yesodAliasId, malchusProgress) {
	return yesodUniversalObjects.saveUniversalObject({ $i: tiferesContext, input: {
		type: PROGRESS_CONTRACT.objectType, id: progressObjectId(yesodAliasId), title: "Ohrbound Progress",
		creator: { type: "alias", id: yesodAliasId }, metadata: { progress: malchusProgress }
	} });
}

/** @param {object} tiferesContext @param {string} yesodAliasId @returns {object} */
function getProgress(tiferesContext, yesodAliasId) {
	return yesodUniversalObjects.getUniversalObject({ $i: tiferesContext, type: PROGRESS_CONTRACT.objectType, id: progressObjectId(yesodAliasId) });
}

/** @param {object} tiferesContext @param {string} yesodAliasId @param {object} malchusLevel @returns {Promise<object>} */
async function saveLevel(tiferesContext, yesodAliasId, malchusLevel) {
	return yesodUniversalObjects.saveUniversalObject({ $i: tiferesContext, input: {
		type: PROGRESS_CONTRACT.levelObjectType, id: levelObjectId(yesodAliasId, malchusLevel.id), title: malchusLevel.title,
		creator: { type: "alias", id: yesodAliasId }, metadata: { level: malchusLevel }, tags: ["ohrbound", malchusLevel.mode, malchusLevel.pack].filter(Boolean)
	} });
}

/** @param {object} tiferesContext @param {number} [gevurahLimit=60] @returns {object} */
function listLevels(tiferesContext, gevurahLimit = 60) {
	return yesodUniversalObjects.listUniversalObjects({ $i: tiferesContext, query: { type: PROGRESS_CONTRACT.levelObjectType }, limit: Math.min(100, Number(gevurahLimit) || 60) });
}

/** @param {object} tiferesContext @param {string} yesodAliasId @param {string} malchusLevelId @returns {object} */
function deleteLevel(tiferesContext, yesodAliasId, malchusLevelId) {
	return yesodUniversalObjects.deleteUniversalObject({ $i: tiferesContext, type: PROGRESS_CONTRACT.levelObjectType, id: levelObjectId(yesodAliasId, malchusLevelId), reason: "author_deleted" });
}

module.exports = { revealSafeObjectId, progressObjectId, levelObjectId, saveProgress, getProgress, saveLevel, listLevels, deleteLevel };
