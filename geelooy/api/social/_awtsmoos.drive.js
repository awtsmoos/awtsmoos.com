//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialDriveRoutes
 * @description
 * The Awtsmoos unifies management, durable projects, Project Testimony, canonical sites, domain claims,
 * credentials, guarded quotas, reconciliation, bounded streaming, and service provisioning through small guarded doors.
 */

const actionRoutes = require('./helper/drive/routes/actionRoutes.js');
const credentialRoutes = require('./helper/drive/routes/credentialRoutes.js');
const domainRoutes = require('./helper/drive/routes/domainRoutes.js');
const entryRoutes = require('./helper/drive/routes/entryRoutes.js');
const managerRoutes = require('./helper/drive/routes/managerRoutes.js');
const projectPlanRoutes = require('./helper/drive/routes/projectPlanRoutes.js');
const projectRegistryRoutes = require('./helper/drive/routes/projectRegistryRoutes.js');
const publicRoutes = require('./helper/drive/routes/publicRoutes.js');
const quotaRoutes = require('./helper/drive/routes/quotaRoutes.js');
const reconciliationRoutes = require('./helper/drive/routes/reconciliationRoutes.js');
const siteRoutes = require('./helper/drive/routes/siteRoutes.js');
const streamingRoutes = require('./helper/drive/routes/streamingRoutes.js');
const serviceProvisioningRoutes = require('./helper/drive/routes/serviceProvisioningRoutes.js');

module.exports = vessel => ({
	...managerRoutes(vessel),
	...publicRoutes(vessel),
	...streamingRoutes(vessel),
	...entryRoutes(vessel),
	...siteRoutes(vessel),
	...domainRoutes(vessel),
	...projectRegistryRoutes(vessel),
	...projectPlanRoutes(vessel),
	...actionRoutes(vessel),
	...credentialRoutes(vessel),
	...quotaRoutes(vessel),
	...reconciliationRoutes(vessel),
	...serviceProvisioningRoutes(vessel)
});
