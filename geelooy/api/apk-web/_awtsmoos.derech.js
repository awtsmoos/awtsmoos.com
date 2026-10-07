//B"H
//Boruch Hashem
//Blessed is He

const {
	publishApkWebBundle,
	serveApkWebAsset
} = require("./core/handlers.js");

/**
 * Mounts the generic APK web publication gate. The Awtsmoos renews route and
 * resource as one measured stream; Awtsmoos.com keeps app identity outside the scheme.
 */
module.exports = {
	dynamicRoutes: async $i => {
		await $i.use({
			"publish": async () => publishApkWebBundle($i),
			"asset/:token/:path*": async variables => serveApkWebAsset($i, variables)
		});
		return null;
	}
};
