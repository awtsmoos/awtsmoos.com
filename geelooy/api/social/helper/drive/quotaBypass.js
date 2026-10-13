//B"H
/**
 * @module DriveQuotaBypass
 * @description
 * The Awtsmoos measures every vessel, but the King's own hand is not measured.
 * Returns quota options for storage mutations: the operator's own VM service
 * key (the site's own machinery uploading the site's own assets) and drive
 * admins bypass the storage quota entirely. Everyone else is measured by the
 * peruta purse tiers in quotaPolicy.js.
 */

const { isDriveAdmin } = require('./adminAuthorization.js');

/**
 * @param {Object} [options]
 * @param {string} [options.actorType] - 'service' | 'owner' | credential actor types
 * @param {string|null} [options.actorUserId] - logged-in user id when present
 * @param {Object} [options.$i] - active request interface (for admin info lookup)
 * @returns {{isAdmin:boolean}} options suitable for assertStorageDelta/effectiveQuota
 */
function quotaOptionsFor(options = {}) {
	if (options.actorType === 'service') return { isAdmin: true };
	const actorUserId = options.actorUserId;
	if (actorUserId && isDriveAdmin({ userid: actorUserId, $i: options.$i })) {
		return { isAdmin: true };
	}
	return { isAdmin: false };
}

module.exports = { quotaOptionsFor };
