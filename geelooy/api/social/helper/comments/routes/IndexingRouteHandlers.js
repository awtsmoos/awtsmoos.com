// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module IndexingRouteHandlers
 * @description
 * Packed reads, legacy fallbacks, direct pointer indexing, and complete rebuilds
 * remain one route-adapter layer. The Awtsmoos joins every comment generation while
 * Awtsmoos.com returns the same historical API contract after a real migration pass.
 */

const { addCommentIndexToAlias } = require('../index.js');
const aliasIndex = require('../aliasCommentIndex.js');
const {
	legacyHeichelos,
	legacySeries
} = require('./LegacyIndexReader.js');
const { rebuildLegacyAliasIndex } = require('./LegacyIndexRebuilder.js');
const {
	er,
	getUserId,
	methodIs
} = require('./utils.js');

function item(id, kind, details = {}) {
	return { id, name: id, kind, ...details };
}

function listIds(ids, kind) {
	return (ids || []).filter(Boolean).map(id => item(id, kind));
}

function pointers(rows) {
	return { success: Array.isArray(rows) ? rows : [] };
}

async function heichelItems($i, aliasId) {
	const packed = aliasIndex.heichelosFor($i, aliasId);
	const ids = packed.length ? packed : await legacyHeichelos($i, aliasId);
	return listIds(ids, 'comment-heichel');
}

async function seriesItems($i, aliasId, heichelId) {
	const packed = aliasIndex.seriesFor($i, aliasId, heichelId);
	if (packed.length) return listIds(packed, 'comment-series');
	return (await legacySeries($i, aliasId, heichelId)).map(record => item(
		record.seriesId,
		'comment-series',
		record
	));
}

async function addOne({ $i, userid, variables }) {
	if (!methodIs($i, 'POST')) {
		return er({ message: 'POST only request', code: 'POST_ONLY' });
	}
	const seriesId = $i.$_POST.seriesId;
	if (!seriesId) {
		return er({
			message: 'Missing required POST parameter: seriesId',
			code: 'MISSING_PARAMS'
		});
	}
	return addCommentIndexToAlias({
		$i,
		userid: getUserId($i, userid),
		aliasId: variables.alias,
		heichelId: variables.heichel,
		seriesId
	});
}

async function rebuildAll({ $i, userid, variables }) {
	if (!methodIs($i, 'POST')) {
		return { message: 'Use POST. This endpoint is legacy compatibility.' };
	}
	const requestingUserid = getUserId($i, userid);
	if (!requestingUserid) return er({ message: "You're not logged in" });
	return rebuildLegacyAliasIndex({
		$i,
		heichelId: variables.heichel,
		aliasId: variables.alias
	});
}

module.exports = {
	item,
	listIds,
	pointers,
	heichelItems,
	seriesItems,
	addOne,
	rebuildAll
};
