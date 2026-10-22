//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UnifiedProfileHubRoutes
 * @description
 * Public identity, authored posts, rich comments, graph references, roles, and
 * visibility-filtered activity become one profile response. The Awtsmoos knows the
 * whole person while Awtsmoos.com verifies any viewer alias before private scope.
 *
 * B"H 2026-10-21 (Worker N — pagination): the profile-hub read now forwards
 * the shared ProfilePagination query params (postsLimit/postsCursor,
 * commentsLimit/commentsCursor) into profileOverview.
 */

const { profileOverview } = require('./helper/profileHub/ProfileOverview.js');
const {
	withVerifiedAlias,
	aliasFromRequest,
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');
const { getQuery } = require('./helper/profile/apiTools.js');
const { pageOptsFrom } = require('./helper/profileHub/ProfilePagination.js');

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
	const pageOpts = pageOptsFrom(getQuery($i) || {});
	const read = () => profileOverview({
		$i,
		aliasId,
		viewerAliasId,
		...pageOpts
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
