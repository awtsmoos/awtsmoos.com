//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DecisionService
 * @description
 * High-impact cooperative decisions on Awtsmoos.com declare policy, eligible
 * voters, quorum, threshold, timeout, fallback, objections, and audit. The
 * Awtsmoos is sovereign; finite groups resolve shared authority transparently.
 */
export class DecisionService {
	create(request, decisionId) {
		if (!request.policy || !request.eligibleVoterIds?.length) {
			throw new Error('DecisionService: policy and eligible voters required');
		}
		return {
			id: decisionId,
			policy: request.policy,
			options: [...request.options],
			eligibleVoterIds: [...new Set(request.eligibleVoterIds)],
			quorum: request.quorum,
			threshold: request.threshold,
			expiresAtMinute: request.expiresAtMinute,
			fallbackOptionId: request.fallbackOptionId,
			votes: {},
			objections: [],
			status: 'open',
			result: null
		};
	}

	vote(decision, voterId, optionId, objection = null) {
		if (
			decision.status !== 'open' ||
			!decision.eligibleVoterIds.includes(voterId) ||
			!decision.options.includes(optionId)
		) {
			throw new Error('DecisionService: vote is ineligible');
		}
		return {
			...decision,
			votes: { ...decision.votes, [voterId]: optionId },
			objections: objection
				? [...decision.objections, { voterId, objection }]
				: decision.objections
		};
	}

	resolve(decision, simulationMinute) {
		const votes = Object.values(decision.votes);
		const quorumMet = votes.length >= decision.quorum;
		const counts = Object.fromEntries(
			decision.options.map(option => [
				option,
				votes.filter(vote => vote === option).length
			])
		);
		const ordered = [...decision.options].sort((first, second) => {
			return counts[second] - counts[first] || first.localeCompare(second);
		});
		const winner = quorumMet && counts[ordered[0]] >= decision.threshold
			? ordered[0]
			: simulationMinute >= decision.expiresAtMinute
				? decision.fallbackOptionId
				: null;
		return winner
			? { ...decision, status: 'resolved', result: winner, counts }
			: { ...decision, counts };
	}
}
