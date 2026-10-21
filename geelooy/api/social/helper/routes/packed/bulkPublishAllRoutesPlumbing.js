//B"H
//Blessed is He
//Boruch Hashem

/**
 * Bulk publish shared job plumbing re-exported from bulkImportRoutes (split from bulkPublishAllRoutes.js).
 */

const { PackedBulkImportRoutes, __bulkPlumbing } = require('./bulkImportRoutes.js');
const { newJobId, setJob, runningJob, appendJobLog, yieldTick, perPostPath } = __bulkPlumbing;

module.exports = { newJobId, setJob, runningJob, appendJobLog, yieldTick, perPostPath };
