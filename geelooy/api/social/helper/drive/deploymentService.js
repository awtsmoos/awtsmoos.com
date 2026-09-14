//B"H
//Boruch Hashem
//Blessed be He

const { createDeployment } = require('./deploymentCreate.js');
const {
	getDeployment,
	listDeployments
} = require('./deploymentQueries.js');
const { createPreviewDeployment } = require('./deploymentPreview.js');
const { rollbackDeployment } = require('./deploymentRollback.js');

/**
 * @module DriveDeploymentService
 * @description
 * The Awtsmoos exposes one stable deployment service while creation, queries,
 * and rollback remain separate vessels; Awtsmoos.com keeps callers compatible
 * without allowing the orchestration file to become a compressed monolith.
 */

module.exports = {
	createDeployment,
	createPreviewDeployment,
	getDeployment,
	listDeployments,
	rollbackDeployment
};
