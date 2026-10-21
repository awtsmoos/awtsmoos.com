//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadingAnalyticsRoutes
 * @description
 * Barrel for ReadingAnalyticsRoutes: class plus prototype mixins, identical export surface.
 */

const { ReadingAnalyticsRoutes } = require('./readingRoutesClass.js');
const heartbeatMixin = require('./readingRoutesHeartbeat.js');
const statsMixin = require('./readingRoutesStats.js');
const privacyMixin = require('./readingRoutesPrivacy.js');
Object.assign(ReadingAnalyticsRoutes.prototype, heartbeatMixin, statsMixin, privacyMixin);

function createReadingAnalyticsRoutes({ $i, userid } = {}) {
	return new ReadingAnalyticsRoutes({ $i, userid }).routes();
}

module.exports = { ReadingAnalyticsRoutes, createReadingAnalyticsRoutes };
