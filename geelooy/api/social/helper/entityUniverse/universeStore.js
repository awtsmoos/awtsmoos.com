//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module universeStore
 * @description
 * Barrel for universeStore: re-exports the identical surface from its sibling modules.
 */

const { writeEntity, getEntity, listEntities } = require('./universeStoreEntities.js');
const { linkEntities, listEdges, addChild, getChildren } = require('./universeStoreEdges.js');
const { snapshotEntity, forkEntity, materializeDna, getDna } = require('./universeStoreDna.js');

module.exports = {
	writeEntity,
	getEntity,
	listEntities,
	linkEntities,
	listEdges,
	addChild,
	getChildren,
	snapshotEntity,
	forkEntity,
	materializeDna,
	getDna
};
