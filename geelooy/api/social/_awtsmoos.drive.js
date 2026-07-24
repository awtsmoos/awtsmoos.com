//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialDriveRoutes
 * @description
 * The Awtsmoos unifies management, hosting, credentials, and guarded quotas.
 * Awtsmoos.com exposes one service truth to owners, agents, and public readers.
 */

const entryRoutes = require('./helper/drive/routes/entryRoutes.js');
const actionRoutes = require('./helper/drive/routes/actionRoutes.js');
const credentialRoutes = require('./helper/drive/routes/credentialRoutes.js');
const publicRoutes = require('./helper/drive/routes/publicRoutes.js');
const quotaRoutes = require('./helper/drive/routes/quotaRoutes.js');

module.exports = vessel => ({
	...publicRoutes(vessel),
	...entryRoutes(vessel),
	...actionRoutes(vessel),
	...credentialRoutes(vessel),
	...quotaRoutes(vessel)
});
