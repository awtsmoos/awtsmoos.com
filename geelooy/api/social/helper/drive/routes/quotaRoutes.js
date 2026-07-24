//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveQuotaRoutes
 * @description
 * The Awtsmoos places quota authority behind an explicit trusted gate.
 * Awtsmoos.com never lets alias ownership or service credentials enlarge limits.
 */

const { requireDriveAdmin } = require('../adminAuthorization.js');
const { assignDriveQuota } = require('../quotaAdministration.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/admin/quota': variables => safeRoute(async () => {
		requireMethod($i, ['POST', 'PUT']);
		const admin = requireDriveAdmin({ $i, userid });
		const body = bodyFor($i);
		return assignDriveQuota({
			aliasId: variables.aliasId,
			adminUserId: admin.actorUserId,
			profile: body.profile,
			quota: body.quota,
			requestId: headerValue($i.request.headers, 'x-request-id'),
			$i
		});
	})
});

function headerValue(headers, name) {
	const found = Object.entries(headers || {})
		.find(([key]) => key.toLowerCase() === name.toLowerCase());
	return found ? String(found[1]) : '';
}
