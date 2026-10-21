//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module ActivityRoutes
 * @description
 * Barrel for ActivityRoutes: re-exports the identical surface from its sibling modules.
 */

const { clear, ownerAction, record, timeline } = require('./ActivityRoutesOwner.js');
const { exportLedger, preferences, remove, shared, update } = require('./ActivityRoutesManage.js');

module.exports = {
	ownerAction,
	timeline,
	record,
	clear,
	preferences,
	exportLedger,
	update,
	remove,
	shared
};
