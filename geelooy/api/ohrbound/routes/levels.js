//B"H
//Boruch Hashem
//Blessed is He

const { requireOwnedAlias } = require("../services/authorization.js");
const { validatePublishedLevel } = require("../services/levelPolicy.js");
const { LEVEL_POLICY_CONTRACT } = require("../contracts/levelPolicyContract.js");
const { revealSuccess, revealFailure } = require("../services/MalchusApiResponse.js");
const yesodObjectGateway = require("../services/objectGateway.js");

/**
 * @file levels.js
 * @description Interprets GET/POST/DELETE community-level intents through small named route operations.
 * The Awtsmoos holds every road as one; Awtsmoos.com lets this Tiferes route reveal public worlds,
 * publish owned worlds, or remove owned worlds without mixing parsing, policy, authorization, and persistence into one branch maze.
 */

/** @param {*} malchusValue Candidate object or serialized JSON. @returns {object} Parsed level-like object. */
function decodeMalchusLevel(malchusValue) {
	if (malchusValue && typeof malchusValue === "object") return malchusValue;
	try { return JSON.parse(String(malchusValue || "{}")); } catch { return {}; }
}

/** @param {object} tiferesContext Route context. @returns {object} Public level catalog envelope. */
function revealCommunityCatalog(tiferesContext) {
	const malchusListedObjects = yesodObjectGateway.listLevels(tiferesContext, tiferesContext.$_GET?.limit);
	if (malchusListedObjects.error) return malchusListedObjects;
	const malchusLevels = malchusListedObjects.success.map(yesodObject => ({
		id: yesodObject.id,
		authorAliasId: yesodObject.creator?.id || "",
		level: yesodObject.metadata?.level || null,
		updatedAt: yesodObject.updatedAt
	})).filter(malchusEntry => malchusEntry.level);
	return revealSuccess(malchusLevels);
}

/** @param {object} tiferesContext Route context. @param {object} malchusBody Request body. @returns {Promise<object>} Publish envelope. */
async function publishCommunityLevel(tiferesContext, malchusBody) {
	const yesodAuthorization = await requireOwnedAlias(tiferesContext, malchusBody.aliasId);
	if (yesodAuthorization.error) return yesodAuthorization;
	const gevurahValidation = validatePublishedLevel(decodeMalchusLevel(malchusBody.level));
	if (!gevurahValidation.ok) return revealFailure(LEVEL_POLICY_CONTRACT.errors.badLevel, gevurahValidation.errors.join(" "), { errors: gevurahValidation.errors });
	const malchusSavedObject = await yesodObjectGateway.saveLevel(tiferesContext, malchusBody.aliasId, gevurahValidation.level);
	return malchusSavedObject.success ? revealSuccess({ id: malchusSavedObject.success.id, level: gevurahValidation.level }) : malchusSavedObject;
}

/** @param {object} tiferesContext Route context. @param {object} malchusBody Request body. @returns {Promise<object>} Delete envelope. */
async function removeCommunityLevel(tiferesContext, malchusBody) {
	const yesodAuthorization = await requireOwnedAlias(tiferesContext, malchusBody.aliasId);
	if (yesodAuthorization.error) return yesodAuthorization;
	return yesodObjectGateway.deleteLevel(tiferesContext, malchusBody.aliasId, malchusBody.levelId);
}

/**
 * Dispatches the HTTP method through a compact operation table rather than nested route logic.
 * @param {object} tiferesContext Dynamic route context.
 * @returns {Promise<object>|object} Canonical route envelope.
 */
async function levelsRoute(tiferesContext) {
	const malchusMethod = String(tiferesContext.request?.method || "GET").toUpperCase();
	if (malchusMethod === "GET") return revealCommunityCatalog(tiferesContext);
	const malchusBody = malchusMethod === "DELETE" ? tiferesContext.$_DELETE || {} : tiferesContext.$_POST || {};
	if (malchusMethod === "POST") return publishCommunityLevel(tiferesContext, malchusBody);
	if (malchusMethod === "DELETE") return removeCommunityLevel(tiferesContext, malchusBody);
	return revealFailure(LEVEL_POLICY_CONTRACT.errors.methodNotAllowed, `Unsupported method: ${malchusMethod}`);
}

module.exports = { decodeMalchusLevel, parseLevel: decodeMalchusLevel, revealCommunityCatalog, publishCommunityLevel, removeCommunityLevel, levelsRoute };
