//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelRouteTools
 * @description
 * The Awtsmoos is beyond transport ceremony, while Awtsmoos.com lets one compatibility facade gather method Gevurah, query Binah, viewer truth, and Malchus response clothing;
 * every historical export remains stable so deeper organization can grow without making existing callers start over.
 */
const { BinahRequestQuery } = require('../../api/BinahRequestQuery.js');
const { GevurahRouteMethodPolicy } = require('../../api/GevurahRouteMethodPolicy.js');
const { MalchusResponseGarments } = require('../../api/MalchusResponseGarments.js');
const { er } = require('../../general.js');
const { verifiedViewerAlias } = require('../../socialSummary/SocialSummaryViewer.js');

const gevurahMethod = new GevurahRouteMethodPolicy({
	errorFactory: er,
	errorCode: 'BAD_METHOD'
});

/**
 * Builds the canonical Social Kernel target without mutating caller input.
 * @param {Object} source Route input vessel.
 * @returns {Object} Kernel target descriptor.
 */
function targetFrom(source = {}) {
	return {
		type: source.type || source.entityType,
		id: source.id || source.entityId,
		heichelId: source.heichelId,
		seriesId: source.seriesId || 'root',
		postId: source.postId,
		parentId: source.parentId,
		aliasId: source.aliasId
	};
}

/**
 * Preserves historic batch-target decoding from POST arrays or JSON strings.
 * @param {Object} $i Awtsmoos route context.
 * @returns {Array} Parsed targets or an empty list.
 */
function parseTargets($i = {}) {
	const raw = $i.$_POST?.targets;
	if (Array.isArray(raw)) {
		return raw;
	}
	if (typeof raw !== 'string') {
		return [];
	}
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

/**
 * Preserves the compatibility truth vocabulary through shared Binah parsing.
 * @param {*} value Candidate flag.
 * @returns {boolean} Whether the flag means true.
 */
function truthyFlag(value) {
	return BinahRequestQuery.truthy(value);
}

/**
 * Preserves the historic BAD_METHOD envelope through the shared Gevurah policy.
 * @param {Object} $i Awtsmoos route context.
 * @param {string|string[]} expected Allowed method or methods.
 * @returns {Object|null} Null when allowed, legacy error otherwise.
 */
function methodOnly($i, expected) {
	return gevurahMethod.require($i, expected);
}

/**
 * Resolves the verified viewer alias using the same GET/POST source semantics as before.
 * @param {Object} options Route identity inputs.
 * @returns {Promise<string>} Verified viewer alias or empty identity.
 */
async function viewerAlias({ $i, userid }) {
	const body = $i.request.method === 'POST'
		? $i.$_POST
		: $i.$_GET;
	return verifiedViewerAlias({
		$i,
		userid,
		requestedAliasId: body?.viewerAliasId || ''
	});
}

/**
 * Preserves the exact Social Kernel v1 success garment.
 * @param {*} data Route payload.
 * @param {Object} meta Additional kernel metadata.
 * @returns {Object} Kernel v1 response.
 */
function ok(data, meta = {}) {
	return MalchusResponseGarments.kernelSuccess(data, meta);
}

module.exports = {
	methodOnly,
	ok,
	parseTargets,
	targetFrom,
	truthyFlag,
	viewerAlias
};
