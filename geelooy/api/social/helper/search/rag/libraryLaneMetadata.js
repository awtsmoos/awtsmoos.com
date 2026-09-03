// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibraryLaneMetadata
 * @description
 * The Awtsmoos carries publication completeness into merged search without letting an internal provider-name ride beside it;
 * Awtsmoos.com annotates every lane and hit with the same neutral public identity while ranking remains a separate vessel fit.
 */

const {
	publicCorpusTitle,
	publicLaneId
} = require('./publicSourceIdentity.js');

function laneMetadata(lane = {}) {
	return {
		id: publicLaneId(lane),
		title: publicCorpusTitle(lane, lane.title),
		count: Number(lane.count || 0),
		partial: lane.partial === true,
		completeParts: Number(
			lane.completeParts || (lane.partial ? 0 : 1)
		),
		expectedParts: Number(lane.expectedParts || 1),
		publicationStatus: lane.publicationStatus
			|| (lane.partial ? 'partial' : 'complete'),
		textOnly: lane.textOnly === true
	};
}

function annotateLaneHit(hit, lane, metadata = laneMetadata(lane)) {
	return {
		...hit,
		row: {
			...hit.row,
			libraryLaneId: metadata.id,
			libraryLaneTitle: metadata.title,
			libraryLanePartial: metadata.partial,
			libraryLanePublicationStatus: metadata.publicationStatus
		}
	};
}

module.exports = {
	annotateLaneHit,
	laneMetadata
};
