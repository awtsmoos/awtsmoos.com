//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PlatformFeedRoutes
 * @description
 * Yaakov 2026-10-11: the social feed is now a smart ranked river, not a
 * timestamp sort. Home ranking blends recency decay, engagement velocity,
 * alias affinity, and a diversity guard so one voice never floods the river.
 * Trending measures real recent engagement velocity (test/smoke fixtures are
 * excluded). All feeds paginate via offset and share a short-TTL rank cache
 * so the river stays fast under load.
 */

const { feedHome, feedHeichel, feedTrending, feedDiscover } = require('./feedRoutesBasic.js');
const { feedLatest, feedPopular } = require('./feedRoutesGlobal.js');
const { feedPersonalized } = require('./feedRoutesPersonalized.js');

module.exports = { feedHome, feedHeichel, feedTrending, feedDiscover, feedLatest, feedPopular, feedPersonalized };
