// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VirtualSeriesMeta
 * @description
 * The window knows where it faces. This module reads only virtual-series
 * identity, canonical references, and alternate-group metadata; it never reads
 * or mutates post content.
 */

const {
	sp
} = require("../_awtsmoos.constants.js");

function seriesBasePath(heichelId, seriesId) {
	return `${sp}/heichelos/${heichelId}/series/${seriesId}`;
}

function prateemPath(heichelId, seriesId) {
	return `${seriesBasePath(heichelId, seriesId)}/prateem`;
}

function subSeriesPath(heichelId, seriesId) {
	return `${seriesBasePath(heichelId, seriesId)}/subSeries`;
}

function alternateGroupsPath(heichelId, seriesId) {
	return `${seriesBasePath(heichelId, seriesId)}/alternateGroups`;
}

async function getSafe($i, logicalPath, options = { max: true }) {
	try {
		return await $i.db.get(logicalPath, options);
	} catch {
		return null;
	}
}

async function readPrateem($i, heichelId, seriesId) {
	return getSafe($i, prateemPath(heichelId, seriesId));
}

function isVirtualPrateem(prateem) {
	return Boolean(
		prateem?.virtualSeries
		|| prateem?.isVirtualSeries
		|| prateem?.referenceMode === "subSeriesPosts"
	);
}

async function isVirtualSeries({ $i, heichelId, seriesId }) {
	const prateem = await readPrateem($i, heichelId, seriesId);
	return isVirtualPrateem(prateem) ? prateem : null;
}

async function referencedSeriesIds($i, heichelId, seriesId, prateem) {
	if (Array.isArray(prateem?.referencedSeriesIds)) {
		return prateem.referencedSeriesIds;
	}
	if (Array.isArray(prateem?.virtualSeries?.referencedSeriesIds)) {
		return prateem.virtualSeries.referencedSeriesIds;
	}
	const children = await getSafe($i, subSeriesPath(heichelId, seriesId));
	return Array.isArray(children) ? children : [];
}

async function getAlternateGroups({
	$i,
	heichelId,
	seriesId,
	withDetails = false
}) {
	const ids = await getSafe($i, alternateGroupsPath(heichelId, seriesId));
	if (!Array.isArray(ids)) return [];
	if (!withDetails) return ids;
	const output = [];
	for (const id of ids) {
		const prateem = await readPrateem($i, heichelId, id);
		if (prateem) output.push(prateem);
	}
	return output;
}

module.exports = {
	getAlternateGroups,
	isVirtualSeries,
	referencedSeriesIds
};
