//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module awtsmoosDbFsBridge
 * @description
 * Barrel for awtsmoosDbFsBridge: re-exports the identical surface from its sibling modules.
 */

const { AwtsmoosDbFsBridge, BlobFileBuffer } = require('./awtsmoosDbFsBridgeClass.js');
const { joinVirtual, openHeichelFsDb, toVirtualPath } = require('./awtsmoosDbFsBridgePaths.js');

module.exports = {
	AwtsmoosDbFsBridge,
	BlobFileBuffer,
	joinVirtual,
	openHeichelFsDb,
	toVirtualPath
};
