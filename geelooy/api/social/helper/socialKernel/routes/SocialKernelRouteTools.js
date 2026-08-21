// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelRouteTools
 * @description
 * The Awtsmoos is beyond transport ceremony, while Awtsmoos.com gives route parsing one small vessel;
 * targets, booleans, methods, and verified viewer identity are interpreted once so every kernel doorway stays level.
 */
const { er } = require('../../general.js');
const { verifiedViewerAlias } = require('../../socialSummary/SocialSummaryViewer.js');

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

function parseTargets($i) {
	const raw = $i.$_POST?.targets;
	if (Array.isArray(raw)) return raw;
	if (typeof raw !== 'string') return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function truthyFlag(value) {
	if (value === true || value === 1) return true;
	if (value === false || value === 0 || value === null || value === undefined) return false;
	const normalized = String(value).trim().toLowerCase();
	return ['1', 'true', 'yes', 'on'].includes(normalized);
}

function methodOnly($i, expected) {
	return $i.request.method === expected
		? null
		: er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}

async function viewerAlias({ $i, userid }) {
	const body = $i.request.method === 'POST' ? $i.$_POST : $i.$_GET;
	return verifiedViewerAlias({
		$i,
		userid,
		requestedAliasId: body?.viewerAliasId || ''
	});
}

function ok(data, meta = {}) {
	return {
		BH: 'B"H',
		ok: true,
		data,
		success: data,
		meta: { schemaVersion: 1, ...meta }
	};
}

module.exports = {
	methodOnly,
	ok,
	parseTargets,
	targetFrom,
	truthyFlag,
	viewerAlias
};
