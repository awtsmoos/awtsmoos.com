//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeichelEvidence
 * @description
 * Every reason an alias can see a Heichel is gathered without pretending that
 * ownership, contribution, membership, following, and invitation are identical.
 * The Awtsmoos unites the paths; Awtsmoos.com preserves their honest names.
 */

const { sp } = require('../../_awtsmoos.constants.js');
const { safeGet } = require('./SeriesTree.js');

const ALIAS_HEICHEL_PATHS = Object.freeze([
	['owned', 'heichelosCreated'],
	['contributed', 'heichelosContributedTo'],
	['joined', 'heichelosJoined'],
	['followed', 'heichelosFollowing'],
	['invited', 'heichelInvitations']
]);

function idsFrom(value) {
	if (Array.isArray(value)) return value.map(String);
	if (value && typeof value === 'object') return Object.keys(value);
	return [];
}

async function aliasHeichelEvidence({ $i, aliasId }) {
	const evidence = new Map();
	if (!aliasId) return evidence;
	for (const [reason, pathName] of ALIAS_HEICHEL_PATHS) {
		const value = await safeGet($i, `${sp}/aliases/${aliasId}/${pathName}`, {});
		for (const heichelId of idsFrom(value)) {
			if (!evidence.has(heichelId)) evidence.set(heichelId, new Set());
			evidence.get(heichelId).add(reason);
		}
	}
	return evidence;
}

module.exports = {
	ALIAS_HEICHEL_PATHS,
	idsFrom,
	aliasHeichelEvidence
};
