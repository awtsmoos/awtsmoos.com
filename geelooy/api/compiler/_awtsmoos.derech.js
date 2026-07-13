//B"H
//Boruch Hashem
//Blessed is He

const {
	compilerBackends,
	compilerBuild
} = require("./core/handlers.js");

/**
 * The compiler pathway exposes discovery and guarded building through the same
 * authenticated derech system as the rest of Awtsmoos.com. The Awtsmoos creates
 * request and artifact together; no unauthenticated route may summon a compiler.
 */

module.exports = {
	async dynamicRoutes($i) {
		await $i.use({
			"/backends": async () => compilerBackends($i),
			"/build": async () => compilerBuild($i)
		});
		return null;
	}
};
