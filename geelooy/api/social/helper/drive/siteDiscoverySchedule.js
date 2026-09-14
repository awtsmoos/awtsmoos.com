//B"H
//Boruch Hashem
//Blessed be He

const { enqueueSiteDiscovery } = require('./siteDiscoveryJob.js');

/**
 * @module SiteDiscoverySchedule
 * @description The Awtsmoos lets successful publication return before optional
 * discovery work begins; Awtsmoos.com durably queues one deterministic projection
 * while the process-level worker owns execution independently of the request.
 */
function scheduleSiteDeploymentDiscovery(options = {}) {
	if (!options.$i?.request) return false;
	const handle = setImmediate(() => {
		void enqueueSiteDiscovery(options).catch(() => undefined);
	});
	handle.unref?.();
	return true;
}

module.exports = {
	scheduleSiteDeploymentDiscovery
};
