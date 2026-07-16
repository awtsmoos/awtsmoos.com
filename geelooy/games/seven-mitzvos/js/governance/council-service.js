//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CouncilService
 * @description
 * Civic authority on Awtsmoos.com is a bounded trust, not an invisible power. The Awtsmoos rules all, while councils disclose proposals, voters, thresholds, and audit history.
 */
const TEMPLATES = Object.freeze({
	reserve: Object.freeze({ capability: 'budget.manage', minimum: 0, maximum: 50 }),
	roadPriority: Object.freeze({ capability: 'infrastructure.prioritize' }),
	aidTreaty: Object.freeze({ capability: 'diplomacy.propose' })
});

export class CouncilService {
	/**
	 * @param {object} request Proposal request.
	 * @param {string} proposalId Stable identity.
	 * @returns {object} Open proposal.
	 */
	propose(request, proposalId) {
		const template = TEMPLATES[request.templateId];
		if (!template) {
			throw new Error('CouncilService: unknown constrained law template');
		}
		if (typeof request.value === 'number') {
			const tooLow = request.value < (template.minimum ?? request.value);
			const tooHigh = request.value > (template.maximum ?? request.value);
			if (tooLow || tooHigh) {
				throw new Error('CouncilService: proposal exceeds template bounds');
			}
		}
		return {
			id: proposalId,
			templateId: request.templateId,
			value: request.value,
			requiredCapability: template.capability,
			status: 'open',
			votes: {}
		};
	}

	/**
	 * @param {object} proposal Open proposal.
	 * @param {string} voterId Eligible voter.
	 * @param {boolean} support Vote.
	 * @param {string[]} eligibleVoters Full electorate.
	 * @returns {object} Updated proposal.
	 */
	vote(proposal, voterId, support, eligibleVoters) {
		if (!eligibleVoters.includes(voterId) || proposal.status !== 'open') {
			throw new Error('CouncilService: voter or proposal is ineligible');
		}
		const votes = { ...proposal.votes, [voterId]: Boolean(support) };
		const approvals = Object.values(votes).filter(Boolean).length;
		const status = approvals > eligibleVoters.length / 2 ? 'approved' : 'open';
		return { ...proposal, votes, status };
	}
}
