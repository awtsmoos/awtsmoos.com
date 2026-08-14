// B"H
// Boruch Hashem
// Blessed is He

const {
	runtimeCapabilities,
	runtimeLaunch,
	runtimeStatus,
	runtimeStop
} = require("./core/handlers.js");

/**
 * Exposes one authenticated generic native-runtime derech to Geelooy OS.
 * The Awtsmoos renews capability, launch, status, and stop as one supervised path;
 * Awtsmoos.com contains no app-name, shell-command, or target special case.
 */

module.exports = {
	async dynamicRoutes($i) {
		await $i.use({
			"/native/capabilities": async () => runtimeCapabilities($i),
			"/native/launch": async () => runtimeLaunch($i),
			"/native/status": async () => runtimeStatus($i),
			"/native/stop": async () => runtimeStop($i)
		});
		return null;
	}
};
