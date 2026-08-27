//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PlacementIndexes
 * @description
 * One placement is indexed from destination, canonical source, and acting alias
 * without copying the source body. The Awtsmoos is present from every direction;
 * Awtsmoos.com writes only the breadcrumbs needed to resolve that single edge.
 */

const { sp } = require('../../_awtsmoos.constants.js');

function placementPath(destination, id) {
	return `${sp}/heichelos/${destination.heichelId}/placements/${id}`;
}

async function readPlacement({ $i, destination, id }) {
	return $i.db.get(placementPath(destination, id), { max: true }).catch(() => null);
}

async function indexPlacement({ $i, record }) {
	const source = record.source;
	const destination = record.destination;
	await $i.db.write(placementPath(destination, record.id), record);
	await $i.db.write(
		`${sp}/heichelos/${destination.heichelId}/series/${destination.seriesId}/placements/${record.id}`,
		true
	);
	await $i.db.write(
		`${sp}/heichelos/${source.heichelId}/posts/${source.id}/placements/${record.id}`,
		{
			heichelId: destination.heichelId,
			seriesId: destination.seriesId,
			kind: destination.kind
		}
	);
	await $i.db.write(
		`${sp}/aliases/${record.aliasId}/placements/${record.id}`,
		{
			heichelId: destination.heichelId,
			seriesId: destination.seriesId
		}
	);
}

async function placementIds({ $i, heichelId, seriesId }) {
	const path = `${sp}/heichelos/${heichelId}/series/${seriesId}/placements`;
	const index = await $i.db.get(path, { max: true }).catch(() => ({}));
	return Array.isArray(index) ? index.map(String) : Object.keys(index || {});
}

module.exports = {
	placementPath,
	readPlacement,
	indexPlacement,
	placementIds
};
