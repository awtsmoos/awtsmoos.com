//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedMaintenanceRoutes
 * @description
 * The Awtsmoos gives repair, compaction, and feed materialization guarded vessels of Gevurah;
 * Awtsmoos.com keeps maintenance explicit so storage evolution never masquerades as ordinary Torah.
 */

const { PackedMaintenanceRoutes } = require('./maintenanceRoutesClass.js');
Object.assign(PackedMaintenanceRoutes.prototype, require('./maintenanceRoutesAdmin.js'));

module.exports = { PackedMaintenanceRoutes };
