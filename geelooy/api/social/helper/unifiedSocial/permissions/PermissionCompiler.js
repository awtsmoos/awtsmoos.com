//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PermissionCompiler
 * @description
 * All role evidence, inherited policy, and requested action meet in one explainable
 * verdict. Awtsmoos.com no longer guesses authority from one array while another
 * record whispers a different law beneath the ever-renewing Awtsmoos.
 */

const {
	capabilitiesForRoles,
	strongestRole,
	hasCapability
} = require('./CapabilityCatalog.js');
const { readRoleEvidence, listKnownMembers } = require('./LegacyRoleReader.js');
const { resolvePolicy } = require('./PolicyResolver.js');

function submissionCapabilities(capabilities, policy, aliasId) {
	const next = new Set(capabilities);
	if (aliasId && policy.allowContentSubmissions) next.add('submitContent');
	if (aliasId && policy.allowReferenceSubmissions) next.add('submitReference');
	return [...next].sort();
}

function directMode(capabilities, policy, kind) {
	const reference = kind === 'reference';
	const publishCapability = reference ? 'publishReference' : 'publishCanonical';
	const submitCapability = reference ? 'submitReference' : 'submitContent';
	const approval = reference
		? policy.requireReferenceApproval
		: policy.requireContentApproval;
	if (hasCapability(capabilities, publishCapability)) return 'direct';
	if (hasCapability(capabilities, submitCapability)) return approval ? 'submit' : 'direct';
	return 'deny';
}

function explanation({ role, mode, kind, policy }) {
	const label = kind === 'reference' ? 'reference placement' : 'content';
	if (mode === 'direct') return `${role} may publish ${label} directly.`;
	if (mode === 'submit') return `${role} may submit ${label}; moderator approval is required.`;
	const allowed = kind === 'reference'
		? policy.allowReferenceSubmissions
		: policy.allowContentSubmissions;
	return allowed
		? `${role} lacks permission to submit or publish this ${label}.`
		: `This destination does not accept ${label} submissions.`;
}

async function compileAccess({ $i, heichelId, seriesId = 'root', aliasId }) {
	const evidence = await readRoleEvidence({ $i, heichelId, aliasId });
	const policy = await resolvePolicy({ $i, heichelId, seriesId });
	const role = strongestRole(evidence.roles);
	const capabilities = submissionCapabilities(
		capabilitiesForRoles(evidence.roles),
		policy.effective,
		aliasId
	);
	const contentMode = directMode(capabilities, policy.effective, 'content');
	const referenceMode = directMode(capabilities, policy.effective, 'reference');
	return {
		heichelId,
		seriesId,
		aliasId: aliasId || '',
		role,
		roles: evidence.roles,
		sources: evidence.sources,
		ownerAlias: evidence.ownerAlias,
		capabilities,
		policy,
		actions: {
			content: {
				mode: contentMode,
				explanation: explanation({
					role,
					mode: contentMode,
					kind: 'content',
					policy: policy.effective
				})
			},
			reference: {
				mode: referenceMode,
				explanation: explanation({
					role,
					mode: referenceMode,
					kind: 'reference',
					policy: policy.effective
				})
			}
		}
	};
}

async function compileMemberList({ $i, heichelId }) {
	const members = await listKnownMembers({ $i, heichelId });
	const out = [];
	for (const member of members) {
		out.push(await compileAccess({
			$i,
			heichelId,
			aliasId: member.aliasId
		}));
	}
	return out;
}

module.exports = {
	compileAccess,
	compileMemberList,
	directMode,
	explanation
};
