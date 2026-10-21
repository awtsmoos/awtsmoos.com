//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module credentialProvisioning
 * @description
 * Barrel for credentialProvisioning: re-exports the identical surface from its sibling modules.
 */

const { provisionDriveCredential } = require('./credentialProvisioningProvision.js');
const { listDriveCredentials, publicCredential, revokeDriveCredential } = require('./credentialProvisioningManage.js');

module.exports = {
	provisionDriveCredential,
	listDriveCredentials,
	revokeDriveCredential,
	publicCredential
};
