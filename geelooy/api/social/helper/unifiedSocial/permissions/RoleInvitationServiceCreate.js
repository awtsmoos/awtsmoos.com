//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module RoleInvitationServiceCreate
 * @description
 * Role invitation creation by authorized administrators.
 */

const { compileAccess } = require('./PermissionCompiler.js');
const { hasCapability } = require('./CapabilityCatalog.js');
const {
	validateMutation,
	mayAssign
} = require('./RoleMutationSchema.js');
const {
	invitationId,
	writeInvitation,
	readInvitation,
	listInvitations,
	updateInvitation
} = require('./RoleInvitationStore.js');
const { writeRole, denied } = require('./RoleMutationService.js');
const { writeGovernanceAudit } = require('./GovernanceAudit.js');
const { notifyGovernance } = require('./GovernanceNotifications.js');

const { recordInvitationEvent } = require('./RoleInvitationServiceEvents.js');

async function createRoleInvitation({ $i, heichelId, actorAliasId, input }) {
	const access = await compileAccess({ $i, heichelId, aliasId: actorAliasId });
	if (!hasCapability(access.capabilities, 'manageMembers')) {
		return denied('This action requires manageMembers.');
	}
	const validation = validateMutation(input, access.role);
	if (!validation.valid || validation.mutation.role === 'guest') {
		return denied('The invitation role is not permitted.', validation.errors);
	}
	const now = Date.now();
	const record = {
		id: invitationId(),
		heichelId,
		invitedAliasId: validation.mutation.memberAliasId,
		invitedByAliasId: actorAliasId,
		role: validation.mutation.role,
		reason: validation.mutation.reason,
		state: 'pending',
		createdAt: now,
		updatedAt: now,
		expiresAt: now + 7 * 24 * 60 * 60 * 1000
	};
	await writeInvitation({ $i, record });
	await recordInvitationEvent({
		$i,
		record,
		action: 'role_invited',
		actorAliasId,
		metadata: { expiresAt: record.expiresAt }
	});
	await notifyGovernance({
		$i,
		targetAliasId: record.invitedAliasId,
		type: 'role_invited',
		heichelId,
		actorAliasId,
		role: record.role,
		invitationId: record.id,
		message: `You were invited to become ${record.role} in ${heichelId}.`
	});
	return { success: record };
}

module.exports = {
	createRoleInvitation
};
