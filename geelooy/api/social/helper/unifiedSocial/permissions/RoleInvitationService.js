//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoleInvitationService
 * @description
 * Authorized administrators may offer a bounded role without granting it; the
 * invited alias accepts or rejects under its own verified session. The Awtsmoos
 * joins giver and receiver directly while Awtsmoos.com revalidates authority,
 * consent, and expiry at the moment the invitation becomes an institutional role.
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

async function respondToInvitation({ $i, heichelId, id, actorAliasId, response }) {
	const record = await readInvitation({ $i, heichelId, id });
	if (!record) return { error: { code: 'INVITATION_NOT_FOUND' } };
	if (record.invitedAliasId !== actorAliasId) return denied('Only the invited alias may respond.');
	if (record.state !== 'pending') return denied('This invitation is no longer pending.');
	if (record.expiresAt < Date.now()) return expireInvitation({ $i, record, actorAliasId });
	if (!['accept', 'reject'].includes(response)) return denied('Respond with accept or reject.');
	if (response === 'accept' && !(await invitationGrantAllowed({ $i, record }))) {
		return denied('The inviter no longer has authority to grant this role.');
	}
	const accepted = response === 'accept';
	const next = await updateInvitation({
		$i,
		record: {
			...record,
			state: accepted ? 'accepted' : 'rejected',
			respondedAt: Date.now()
		}
	});
	await recordInvitationEvent({
		$i,
		record: next,
		action: accepted ? 'role_invitation_accepted' : 'role_invitation_rejected',
		actorAliasId
	});
	if (accepted) {
		await writeRole({
			$i,
			heichelId,
			actorAliasId: record.invitedByAliasId,
			memberAliasId: actorAliasId,
			role: record.role,
			reason: `Accepted invitation ${id}.`,
			action: 'role_granted_from_invitation'
		});
	}
	return { success: next };
}

module.exports = {
	createRoleInvitation,
	recordInvitationEvent,
	expireInvitation,
	invitationGrantAllowed,
	respondToInvitation,
	listInvitations
};
