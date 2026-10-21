//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module RoleInvitationServiceRespond
 * @description
 * Invitation acceptance and rejection under the invited alias session.
 */

const {
	invitationId,
	writeInvitation,
	readInvitation,
	listInvitations,
	updateInvitation
} = require('./RoleInvitationStore.js');
const { writeRole, denied } = require('./RoleMutationService.js');

const { recordInvitationEvent, expireInvitation, invitationGrantAllowed } = require('./RoleInvitationServiceEvents.js');

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
	respondToInvitation
};
