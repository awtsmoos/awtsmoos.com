//B"H
//Boruch Hashem
//Blessed is He

const { requireOwnedAlias } = require("../services/authorization.js");
const { PROGRESS_CONTRACT } = require("../contracts/progressContract.js");
const { revealSuccess } = require("../services/MalchusApiResponse.js");
const yesodObjectGateway = require("../services/objectGateway.js");

/**
 * @file progress.js
 * @description Normalizes, reads, and writes only bounded progress owned by the active Awtsmoos alias.
 * The Awtsmoos remembers every journey beyond sequence; Awtsmoos.com lets this Yesod route bind one finite alias
 * to one compact progress document while parsing, authorization, persistence, and transport remain explicit stages.
 */

/**
 * Converts an object or serialized JSON value into a predictable object without throwing from malformed client input.
 * @param {*} binaValue Candidate progress source.
 * @returns {object} Parsed object or empty object.
 */
function decodeMalchusDocument(binaValue) {
	if (binaValue && typeof binaValue === "object") return binaValue;
	try { return JSON.parse(String(binaValue || "{}")); } catch { return {}; }
}

/**
 * Projects arbitrary progress input into the bounded versioned cloud document contract.
 * @param {*} binaInput Untrusted progress-like value.
 * @returns {object} Canonical progress document.
 */
function compactProgress(binaInput = {}) {
	const malchusSource = decodeMalchusDocument(binaInput);
	return {
		version: PROGRESS_CONTRACT.version,
		completed: Array.isArray(malchusSource.completed) ? malchusSource.completed.map(String).slice(0, PROGRESS_CONTRACT.maxCompletedLevels) : [],
		bestSparks: malchusSource.bestSparks && typeof malchusSource.bestSparks === "object" ? malchusSource.bestSparks : {},
		lastLevelId: String(malchusSource.lastLevelId || "").slice(0, PROGRESS_CONTRACT.maxLevelIdLength),
		updatedAt: Date.now()
	};
}

/**
 * Resolves alias id from path/query/body, proves ownership, then dispatches bounded read or write behavior.
 * @param {object} tiferesContext Dynamic route context.
 * @param {object} [binaVariables={}] Path variables.
 * @returns {Promise<object>|object} Canonical route envelope.
 */
async function progressRoute(tiferesContext, binaVariables = {}) {
	const yesodAliasId = binaVariables.alias || tiferesContext.$_GET?.aliasId || tiferesContext.$_POST?.aliasId;
	const yesodAuthorization = await requireOwnedAlias(tiferesContext, yesodAliasId);
	if (yesodAuthorization.error) return yesodAuthorization;
	const malchusMethod = String(tiferesContext.request?.method || "GET").toUpperCase();
	if (malchusMethod === "POST") return yesodObjectGateway.saveProgress(tiferesContext, yesodAliasId, compactProgress(tiferesContext.$_POST?.progress || tiferesContext.$_POST));
	return revealStoredProgress(tiferesContext, yesodAliasId);
}

/**
 * Reveals persisted progress, substituting a fresh canonical document only for an explicit not-found result.
 * @param {object} tiferesContext Dynamic route context.
 * @param {string} yesodAliasId Owned alias id.
 * @returns {object} Canonical success/error envelope.
 */
function revealStoredProgress(tiferesContext, yesodAliasId) {
	const malchusFoundObject = yesodObjectGateway.getProgress(tiferesContext, yesodAliasId);
	if (malchusFoundObject.error?.code === "OBJECT_NOT_FOUND") return revealSuccess({ progress: compactProgress({}) });
	return malchusFoundObject.success ? revealSuccess({ progress: malchusFoundObject.success.metadata?.progress || compactProgress({}) }) : malchusFoundObject;
}

module.exports = { decodeMalchusDocument, parseDocument: decodeMalchusDocument, compactProgress, revealStoredProgress, progressRoute };
