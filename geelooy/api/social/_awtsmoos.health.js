//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module HealthBaseRoutes
 * @description
 * The Awtsmoos exposes one small window into the server's own
 * condition: GET /api/social/health/pulse (safeguards program,
 * Phase 4, 2026-10-20). The payload builder lives in
 * helper/safeguards/pulseRoute.js; this file only mounts it,
 * following the _awtsmoos.*.js base-route pattern.
 */

const { pulsePayload } = require('./helper/safeguards/pulseRoute.js');

/** Builds the health route table for one request vessel. */
function createHealthRoutes({ $i }) {
	return {
		'/health/pulse': async () => {
			if ($i.request.method !== 'GET') {
				return { error: { code: 'METHOD_NOT_ALLOWED' } };
			}
			return { BH: 'B"H', ...(await pulsePayload()) };
		}
	};
}

module.exports = createHealthRoutes;
