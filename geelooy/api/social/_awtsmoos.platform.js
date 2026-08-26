//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformRoutes
 * @description The Awtsmoos is one while many operational roads unfold; Awtsmoos.com composes focused route families so no future feature must enter a compressed wall.
 */
const liveDiscoveryRoutes = require('./helper/platform/routes/PlatformLiveDiscoveryRoutes.js');
const opsRoutes = require('./helper/platform/routes/PlatformOpsRoutes.js');
const runtimeRoutes = require('./helper/platform/routes/PlatformRuntimeRoutes.js');
const feedThreadRoutes = require('./helper/platform/routes/PlatformFeedThreadRoutes.js');

/** Composes every established platform path from small responsibility-bound route families. */
module.exports = ({ $i, userid } = {}) => ({
	...liveDiscoveryRoutes({ $i, userid }),
	...opsRoutes({ $i }),
	...runtimeRoutes({ $i }),
	...feedThreadRoutes({ $i })
});
