//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PlacementStore
 * @description
 * A canonical entity may shine through another Heichel without being copied.
 * The Awtsmoos remains one through every reflection; Awtsmoos.com writes one
 * deterministic placement record and one native graph edge with full provenance.
 */

const crypto = require('crypto');
const { addGraphReference } = require('../../socialGraph.js');
const { normalizeDestination } = require('../destinations/DestinationSchema.js');
const { normalizeSource } = require('./PublicationPlanSchema.js');
const {
	readPlacement,
	indexPlacement,
	placementIds
} = require('./PlacementIndexes.js');

const GRAPH_KINDS = Object.freeze({
	reference: 'references',
	repost: 'reposts',
	quote: 'quotes',
	excerpt: 'references',
	syndication: 'crossLinks'
});

function placementId(source, destination) {
	const canonical = normalizeSource(source);
	const target = normalizeDestination(destination, 'reference');
	return crypto
		.createHash('sha256')
		.update(JSON.stringify({ canonical, target }))
		.digest('hex')
		.slice(0, 36);
}

function graphEntity(record) {
	return {
		type: 'collection',
		id: record.id,
		heichelId: record.destination.heichelId,
		seriesId: record.destination.seriesId,
		aliasId: record.aliasId
	};
}

async function createPlacement({ $i, aliasId, source, destination }) {
	const canonical = normalizeSource(source);
	const target = normalizeDestination(destination, 'reference');
	const id = placementId(canonical, target);
	const existing = await readPlacement({ $i, destination: target, id });
	if (existing) return { success: existing, idempotentReplay: true };
	const record = {
		id,
		placementId: id,
		aliasId,
		source: canonical,
		destination: target,
		status: 'published',
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	await indexPlacement({ $i, record });
	const graph = await addGraphReference({
		$i,
		kind: GRAPH_KINDS[target.kind] || 'references',
		aliasId,
		from: graphEntity(record),
		to: canonical,
		excerpt: target.excerpt,
		note: target.note
	});
	return { success: { ...record, graph } };
}

async function listDestinationPlacements({ $i, heichelId, seriesId = 'root' }) {
	const ids = await placementIds({ $i, heichelId, seriesId });
	const records = [];
	for (const id of ids) {
		const record = await readPlacement({
			$i,
			destination: { heichelId, seriesId },
			id
		});
		if (record) records.push(record);
	}
	return records.sort((left, right) => right.createdAt - left.createdAt);
}

module.exports = {
	GRAPH_KINDS,
	placementId,
	graphEntity,
	createPlacement,
	listDestinationPlacements
};
