//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MemberGovernanceRoutes
 * @description
 * Heichel membership becomes operable through verified overview, mutation,
 * invitation, and response routes. The Awtsmoos gives every role its present
 * existence while Awtsmoos.com preserves hierarchy, consent, expiry, and audit.
 */

const handlers = require('./helper/unifiedSocial/permissions/MemberGovernanceHandlers.js');
const {
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

function metadata() {
	return {
		success: {
			version: 1,
			assignableRoles: [
				'admin',
				'moderator',
				'editor',
				'contributor',
				'member',
				'follower',
				'guest'
			],
			invitationResponses: ['accept', 'reject'],
			ownerTransferSupported: false,
			dualWritesLegacyRoles: true,
			verifiesAliasOwnership: true
		}
	};
}

module.exports = ({ $i } = {}) => ({
	'/unified-social/governance/meta': async () => metadata(),
	'/unified-social/heichelos/:heichel/governance': async variables => {
		return requireMethod($i, 'GET') || handlers.overview({
			$i,
			heichelId: variables.heichel
		});
	},
	'/unified-social/heichelos/:heichel/members/:member': async variables => {
		return requireMethod($i, 'POST') || handlers.mutate({
			$i,
			heichelId: variables.heichel,
			memberAliasId: variables.member
		});
	},
	'/unified-social/heichelos/:heichel/invitations': async variables => {
		return requireMethod($i, 'POST') || handlers.invite({
			$i,
			heichelId: variables.heichel
		});
	},
	'/unified-social/heichelos/:heichel/invitations/:invitation/respond': async variables => {
		return requireMethod($i, 'POST') || handlers.respond({
			$i,
			heichelId: variables.heichel,
			invitationId: variables.invitation
		});
	}
});

module.exports.metadata = metadata;
