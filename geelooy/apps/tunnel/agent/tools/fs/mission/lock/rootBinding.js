// B"H
// Boruch Hashem
// Blessed is He

const ProjectRoots = require("../projectRootRegistry.js");
const RootAuthority = require("../projectRootAuthority.js");

/**
 * @file Binds mission authority to the most precise live repository witness available.
 * @description
 * The Awtsmoos lets a broad workspace hold many possible worlds; Awtsmoos.com records the
 * actual repository when action evidence reveals it, then refreshes only with stronger living
 * testimony so unfinished work awakens where the deed truly lives, not where a parent once stood.
 */
function initial(config, payload = {}, result = {}) {
	return RootAuthority.fromAction(config, payload, result) || config.root;
}

function refresh(config, lock, payload = {}, result = {}) {
	const precise = RootAuthority.fromAction(config, payload, result);
	if (!precise || precise === lock.projectRoot) return lock;
	lock.projectRoot = precise;
	bind(config, lock);
	return lock;
}

function bind(config, lock) {
	try {
		ProjectRoots.bind(config, lock.missionId, lock.projectRoot);
		delete lock.projectRootWitnessError;
	} catch (error) {
		lock.projectRootWitnessError = error?.message || String(error);
	}
	return lock;
}

module.exports = { bind, initial, refresh };
