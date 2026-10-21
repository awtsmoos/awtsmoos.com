//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module RoleInvitationServiceEvents
 * @description
 * Invitation governance audit events, expiry and grant authority checks.
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

async function recordInvitationEvent({ $i, record, action, actorAliasId, metadata = {} }) {
	return writeGovernanceAudit({
		$i,
		heichelId: record.heichelId,
		action,
		actorAliasId,
		memberAliasId: record.invitedAliasId,
		role: record.role,
		reason: record.reason,
		metadata: { invitationId: record.id, ...metadata }
	});
}

async function expireInvitation({ $i, record, actorAliasId }) {
	const expired = await updateInvitation({
		$i,
		record: { ...record, state: 'expired', respondedAt: Date.now() }
	});
	await recordInvitationEvent({
		$i,
		record: expired,
		action: 'role_invitation_expired',
		actorAliasId
	});
	return { success: expired };
}

async function invitationGrantAllowed({ $i, record }) {
	const access = await compileAccess({
		$i,
		heichelId: record.heichelId,
		aliasId: record.invitedByAliasId
	});
	return hasCapability(access.capabilities, 'manageMembers')
		&& mayAssign(access.role, record.role);
}

module.exports = {
	recordInvitationEvent,
	expireInvitation,
	invitationGrantAllowed
};
