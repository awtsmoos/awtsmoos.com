//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UnifiedProfileHubRoutes
 * @description
 * Public identity, authored posts, rich comments, graph references, roles, and
 * visibility-filtered activity become one profile response. The Awtsmoos knows the
 * whole person while Awtsmoos.com verifies any viewer alias before private scope.
 */

const { profileOverview } = require('./helper/profileHub/ProfileOverview.js');
const {
	withVerifiedAlias,
	aliasFromRequest,
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

function metadata() {
	return {
		success: {
			version: 1,
			tabs: [
				'overview',
				'posts',
				'comments',
				'references',
				'activity',
				'privacy'
			],
			activityPrivateByDefault: true,
			richCommentsCanonical: true,
			referencesCanonical: true
		}
	};
}

async function readProfile({ $i, aliasId }) {
	const viewerAliasId = aliasFromRequest($i);
	const read = () => profileOverview({
		$i,
		aliasId,
		viewerAliasId
	});
	if (!viewerAliasId) return read();
	return withVerifiedAlias({
		$i,
		aliasId: viewerAliasId,
		action: read
	});
}

module.exports = ({ $i } = {}) => ({
	'/unified-social/profile-hub/meta': async () => metadata(),
	'/unified-social/profile-hub/:alias': async variables => {
		return requireMethod($i, 'GET') || readProfile({
			$i,
			aliasId: variables.alias
		});
	}
});

module.exports.metadata = metadata;
module.exports.readProfile = readProfile;
