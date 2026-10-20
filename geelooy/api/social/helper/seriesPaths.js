//B"H
//Blessed is He
//Boruch Hashem
/**
 * Path builders for series storage locations (relocated verbatim from series.js).
 */
const { sp } = require("./_awtsmoos.constants.js");

// Helper paths
const seriesBasePath = (h, s) => `${sp}/heichelos/${h}/series/${s}`;
const seriesPrateemPath = (h, s) => `${seriesBasePath(h, s)}/prateem`;
const seriesSubSeriesPath = (h, s) => `${seriesBasePath(h, s)}/subSeries`;
const seriesPostsPath = (h, s) => `${seriesBasePath(h, s)}/posts`;
const aliasSeriesTrackingPath = (aliasId, h) => `${sp}/aliases/${aliasId}/seriesCreated/inHeichel/${h}`;

module.exports = {
	seriesBasePath,
	seriesPrateemPath,
	seriesSubSeriesPath,
	seriesPostsPath,
	aliasSeriesTrackingPath,
};
