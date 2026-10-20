//B"H
//Blessed is He
//Boruch Hashem


/**
 * Direct series prateem API: thin barrel over the
 * directSeriesPrateem* siblings. Importers need no changes;
 * the export surface is identical.
 */

const { closeAll } = require('./directSeriesStore.js');
var { parseMap, project } = require('./directSeriesPrateemMap.js');
var { decodePrateem } = require('./directSeriesPrateemDecode.js');
var { getDirectSeriesPrateem } = require('./directSeriesPrateemRead.js');

module.exports = {
	closeAll,
	decodePrateem,
	getDirectSeriesPrateem,
	parseMap,
	project
};
