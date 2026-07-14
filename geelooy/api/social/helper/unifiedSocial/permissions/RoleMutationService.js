//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoleMutationService
 * @description
 * Hierarchy-safe role changes rewrite both governance generations, append audit,
 * and notify the affected alias. The Awtsmoos gives all authority from one source;
 * Awtsmoos.com prevents equal-power grants, owner mutation, and silent divergence.
 */

const { compileAccess } = require('./PermissionCompiler.js');
const { hasCapability } = require('./CapabilityCatalog.js');
const { validateMutation } = require('./RoleMutationSchema.js');
const {
	removeLegacyRoles,
	addLegacyRole,
	writeMemberRole
} = require('./RoleIndexes.js');
const { writeGovernanceAudit } = require('./GovernanceAudit.js');
const { notifyGovernance } = require('./GovernanceNotifications.js');

function denied(message, details = []) {
	return {
		error: {
			code: 'ROLE_MUTATION_DENIED',
			message,
			details
		}
	};
}

async function writeRole({
	$i,
	heichelId,
	actorAliasId,
	memberAliasId,
	role,
	reason,
	action = 'role_changed'
}) {
	await removeLegacyRoles({ $i, heichelId, memberAliasId });
	await writeMemberRole({
		$i,
		heichelId,
		memberAliasId,
		role,
		actorAliasId
	});
	await addLegacyRole({ $i, heichelId, memberAliasId, role });
	const audit = await writeGovernanceAudit({
		$i,
		heichelId,
		action,
		actorAliasId,
		memberAliasId,
		role,
		reason
	});
	const notification = await notifyGovernance({
		$i,
		targetAliasId: memberAliasId,
		type: action,
		heichelId,
		actorAliasId,
		role,
		message: role === 'guest'
			? `Your member role in ${heichelId} was removed.`
			: `Your role in ${heichelId} is now ${role}.`
	});
	return {
		success: {
			heichelId,
			memberAliasId,
			role,
			audit,
			notification
		}
	};
}

async function mutateRole({ $i, heichelId, actorAliasId, input }) {
	const access = await compileAccess({ $i, heichelId, aliasId: actorAliasId });
	if (!hasCapability(access.capabilities, 'manageMembers')) {
		return denied('This action requires manageMembers.');
	}
	const validation = validateMutation(input, access.role);
	if (!validation.valid) {
		return denied('The requested role change is not permitted.', validation.errors);
	}
	if (validation.mutation.memberAliasId === access.ownerAlias) {
		return denied('The Heichel owner cannot be changed through member roles.');
	}
	return writeRole({
		$i,
		heichelId,
		actorAliasId,
		...validation.mutation,
		action: validation.mutation.role === 'guest'
			? 'role_revoked'
			: 'role_changed'
	});
}

module.exports = {
	denied,
	writeRole,
	mutateRole
};
