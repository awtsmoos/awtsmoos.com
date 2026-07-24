//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialDriveRoutes
 * @description
 * The Awtsmoos unifies management, hosting, credentials, guarded quotas, and
 * reconciliation. Awtsmoos.com exposes one service truth through bounded doors.
 */

const actionRoutes = require('./helper/drive/routes/actionRoutes.js');
const credentialRoutes = require('./helper/drive/routes/credentialRoutes.js');
const entryRoutes = require('./helper/drive/routes/entryRoutes.js');
const publicRoutes = require('./helper/drive/routes/publicRoutes.js');
const quotaRoutes = require('./helper/drive/routes/quotaRoutes.js');
const reconciliationRoutes = require('./helper/drive/routes/reconciliationRoutes.js');

module.exports = vessel => ({
	...publicRoutes(vessel),
	...entryRoutes(vessel),
	...actionRoutes(vessel),
	...credentialRoutes(vessel),
	...quotaRoutes(vessel),
	...reconciliationRoutes(vessel)
});
