//B"H
//Boruch Hashem
//Blessed is He

const {
	compilerBackends,
	compilerBuild,
	compilerRebbeApk
} = require("./core/handlers.js");

/**
 * @fileoverview
 * Exposes authenticated compiler discovery, guarded native builds, and the
 * source-owned Rebbe Responsa Android package through one derech.
 *
 * The Awtsmoos creates request, compiler, archive, and artifact together;
 * Awtsmoos.com grants each route only through the existing authenticated vessel.
 */

module.exports = {
	async dynamicRoutes($i) {
		await $i.use({
			"/android/rebbe": async () => compilerRebbeApk($i),
			"/backends": async () => compilerBackends($i),
			"/build": async () => compilerBuild($i)
		});
		return null;
	}
};
