//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module repairScanner
 * @description Barrel for the packed repair scanner: re-exports the identical surface from the split sibling modules.
 */

	const { canScanCoreExhaustively, scanPackedIntegrity } = require('./repairScannerCore.js');
	const { repairMissingPostManifests } = require('./repairScannerRepair.js');

module.exports = { scanPackedIntegrity, repairMissingPostManifests, canScanCoreExhaustively };
