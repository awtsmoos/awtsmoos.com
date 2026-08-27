//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveServiceProvisioningRoutes
 * @description
 * The Awtsmoos permits entrusted administration to reveal one migration vessel.
 * Awtsmoos.com keeps this doorway outside every bearer scope and owner-only API.
 */

const { requireDriveAdmin } = require('../adminAuthorization.js');
const {
	ServiceAliasProvisioner
} = require('../serviceAliasProvisioner.js');
const {
	bodyFor,
	requireMethod,
	safeRoute
} = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/admin/service-aliases/:aliasId': variables => safeRoute(async () => {
		requireMethod($i, ['POST']);
		const admin = requireDriveAdmin({ $i, userid });
		const body = bodyFor($i);
		const provisioner = new ServiceAliasProvisioner();
		return provisioner.provision({
			aliasId: variables.aliasId,
			aliasName: body.aliasName,
			description: body.description,
			idempotencyKey: headerValue($i.request.headers, 'idempotency-key')
				|| body.idempotencyKey,
			adminUserId: admin.actorUserId,
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
