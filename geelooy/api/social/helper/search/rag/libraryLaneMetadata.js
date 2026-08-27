// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibraryLaneMetadata
 * @description
 * Carries truthful publication completeness from discovery into merged API lanes
 * and individual search hits without coupling that metadata to ranking logic.
 */

function laneMetadata(lane = {}) {
	return {
		id: lane.id,
		title: lane.title,
		count: Number(lane.count || 0),
		partial: lane.partial === true,
		completeParts: Number(lane.completeParts || (lane.partial ? 0 : 1)),
		expectedParts: Number(lane.expectedParts || 1),
		publicationStatus: lane.publicationStatus || (lane.partial ? 'partial' : 'complete'),
		textOnly: lane.textOnly === true
	};
}

function annotateLaneHit(hit, lane, metadata) {
	return {
		...hit,
		row: {
			...hit.row,
			libraryLaneId: lane.id,
			libraryLaneTitle: lane.title,
			libraryLanePartial: metadata.partial,
			libraryLanePublicationStatus: metadata.publicationStatus
		}
	};
}

module.exports = {
	annotateLaneHit,
	laneMetadata
};
