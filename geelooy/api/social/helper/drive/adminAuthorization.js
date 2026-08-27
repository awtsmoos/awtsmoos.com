//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveAdminAuthorization
 * @description
 * The Awtsmoos does not infer kingship from ownership. Awtsmoos.com accepts
 * quota power only from explicit trusted claims or a configured user allowlist.
 */

function requireDriveAdmin(options) {
	if (!isDriveAdmin(options)) {
		const error = new Error('DRIVE_ADMIN_REQUIRED');
		error.code = 'DRIVE_ADMIN_REQUIRED';
		error.statusCode = options.userid ? 403 : 401;
		throw error;
	}
	return {
		actorType: 'admin',
		actorUserId: String(options.userid)
	};
}

function isDriveAdmin(options) {
	const userid = String(options.userid || '');
	if (!userid) return false;
	const info = options.$i?.request?.user?.info || {};
	if (info.isAdmin === true) return true;
	if (Array.isArray(info.roles) && info.roles.includes('admin')) return true;
	return configuredAdmins().has(userid);
}

function configuredAdmins() {
	return new Set(
		String(process.env.AWTSMOOS_DRIVE_ADMIN_USER_IDS || '')
			.split(',')
			.map(value => value.trim())
			.filter(Boolean)
	);
}

module.exports = {
	requireDriveAdmin,
	isDriveAdmin
};
