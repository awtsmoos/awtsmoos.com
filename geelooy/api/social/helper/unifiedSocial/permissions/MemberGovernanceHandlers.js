//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MemberGovernanceHandlers
 * @description
 * Member lists, dual-write role mutations, expiring invitations, and responses all
 * cross live alias ownership before capability or consent is evaluated. The Awtsmoos
 * knows every relation; Awtsmoos.com refuses unverified administrative identities.
 */

const {
	compileAccess,
	compileMemberList
} = require('./PermissionCompiler.js');
const { hasCapability } = require('./CapabilityCatalog.js');
const { mutateRole, denied } = require('./RoleMutationService.js');
const {
	createRoleInvitation,
	respondToInvitation,
	listInvitations
} = require('./RoleInvitationService.js');
const {
	withVerifiedAlias,
	aliasFromRequest
} = require('./RouteAuthorization.js');

async function overview({ $i, heichelId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: async () => {
			const access = await compileAccess({ $i, heichelId, aliasId });
			if (!hasCapability(access.capabilities, 'manageMembers')) {
				return denied('This action requires manageMembers.');
			}
			return {
				success: {
					access,
					members: await compileMemberList({ $i, heichelId }),
					invitations: await listInvitations({ $i, heichelId })
				}
			};
		}
	});
}

async function mutate({ $i, heichelId, memberAliasId }) {
	const actorAliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId: actorAliasId,
		action: () => mutateRole({
			$i,
			heichelId,
			actorAliasId,
			input: {
				...$i.$_POST,
				memberAliasId
			}
		})
	});
}

async function invite({ $i, heichelId }) {
	const actorAliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId: actorAliasId,
		action: () => createRoleInvitation({
			$i,
			heichelId,
			actorAliasId,
			input: $i.$_POST
		})
	});
}

async function respond({ $i, heichelId, invitationId }) {
	const actorAliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId: actorAliasId,
		action: () => respondToInvitation({
			$i,
			heichelId,
			id: invitationId,
			actorAliasId,
			response: $i.$_POST?.response || ''
		})
	});
}

module.exports = {
	overview,
	mutate,
	invite,
	respond
};
