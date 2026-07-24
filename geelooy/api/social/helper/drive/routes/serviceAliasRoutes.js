//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveServiceAliasRoutes
 * @description
 * The Awtsmoos places migration identity behind one explicit administrator gate.
 * Awtsmoos.com never lets an owner or bearer token summon this provisioning path.
 */

const { requireDriveAdmin } = require('../adminAuthorization.js');
const { provisionDriveServiceAlias } = require('../serviceAliasProvisioning.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }, dependencies = {}) => ({
	'/drive/admin/service-aliases': () => safeRoute(async () => {
		requireMethod($i, ['POST']);
		const admin = requireDriveAdmin({ $i, userid });
		const body = bodyFor($i);
		const provision = dependencies.provisionServiceAlias
			|| provisionDriveServiceAlias;
		return provision({
			...body,
			idempotencyKey: headerValue($i.request.headers, 'idempotency-key')
				|| body.idempotencyKey,
			adminUserId: admin.actorUserId,
			requestId: headerValue($i.request.headers, 'x-request-id'),
			$i
		}, dependencies);
	})
});

function headerValue(headers, name) {
	const found = Object.entries(headers || {})
		.find(([key]) => key.toLowerCase() === name.toLowerCase());
	return found ? String(found[1]) : '';
}

module.exports.headerValue = headerValue;
