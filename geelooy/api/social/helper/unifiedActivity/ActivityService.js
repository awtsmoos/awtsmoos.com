//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module ActivityService
 * @description
 * Barrel for ActivityService: re-exports the identical surface from its sibling modules.
 */

const { applyCapturePreferences, pruneExpired, record, retentionCutoff, stripQuery } = require('./ActivityServiceCapture.js');
const { exportLedger, ownerTimeline, sharedTimeline } = require('./ActivityServiceTimelines.js');
const { remove, update } = require('./ActivityServiceMutations.js');

module.exports = {
	retentionCutoff,
	stripQuery,
	applyCapturePreferences,
	pruneExpired,
	record,
	ownerTimeline,
	sharedTimeline,
	exportLedger,
	update,
	remove
};
