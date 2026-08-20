//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialDriveRoutes
 * @description
 * The Awtsmoos unifies management, durable projects, canonical Sites, hosted runtimes, domains, credentials, quotas, streaming, reconciliation, and service provisioning through small guarded doors;
 * Awtsmoos.com lets every creator cross one main-branch route crown while each focused module preserves its own law, its own proof, and its own measured light.
 */

const actionRoutes = require('./helper/drive/routes/actionRoutes.js');
const browserRoutes = require('./helper/drive/routes/browserRoutes.js');
const credentialRoutes = require('./helper/drive/routes/credentialRoutes.js');
const domainPlanRoutes = require('./helper/drive/routes/domainPlanRoutes.js');
const domainRoutes = require('./helper/drive/routes/domainRoutes.js');
const entryRoutes = require('./helper/drive/routes/entryRoutes.js');
const managerRoutes = require('./helper/drive/routes/managerRoutes.js');
const projectHostingRoutes = require('./helper/drive/routes/projectHostingRoutes.js');
const projectPlanRoutes = require('./helper/drive/routes/projectPlanRoutes.js');
const projectRegistryRoutes = require('./helper/drive/routes/projectRegistryRoutes.js');
const publicRoutes = require('./helper/drive/routes/publicRoutes.js');
const quotaRoutes = require('./helper/drive/routes/quotaRoutes.js');
const reconciliationRoutes = require('./helper/drive/routes/reconciliationRoutes.js');
const siteRoutes = require('./helper/drive/routes/siteRoutes.js');
const siteRuntimeRoutes = require('./helper/drive/routes/siteRuntimeRoutes.js');
const streamingRoutes = require('./helper/drive/routes/streamingRoutes.js');
const serviceProvisioningRoutes = require('./helper/drive/routes/serviceProvisioningRoutes.js');

module.exports = vessel => ({
	...managerRoutes(vessel),
	...publicRoutes(vessel),
	...streamingRoutes(vessel),
	...entryRoutes(vessel),
	...siteRoutes(vessel),
	...siteRuntimeRoutes(vessel),
	...domainRoutes(vessel),
	...domainPlanRoutes(vessel),
	...projectRegistryRoutes(vessel),
	...projectPlanRoutes(vessel),
	...projectHostingRoutes(vessel),
	...actionRoutes(vessel),
	...browserRoutes(vessel),
	...credentialRoutes(vessel),
	...quotaRoutes(vessel),
	...reconciliationRoutes(vessel),
	...serviceProvisioningRoutes(vessel)
});
