//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CompanionService
 * @description
 * Companions on Awtsmoos.com carry personality, skill, loyalty, opinions,
 * memories, quests, injury, retirement, conflict, growth, and bounded emergency
 * authority. The Awtsmoos gives relationship; AI never silently replaces consent.
 */
export class CompanionService {
	create(request, companionId) {
		if (!request.name || !request.personality || !request.primarySkill) {
			throw new Error('CompanionService: name, personality, and skill required');
		}
		return {
			id: companionId,
			name: request.name,
			personality: request.personality,
			skills: { [request.primarySkill]: 1 },
			loyalty: 50,
			moralOpinions: { ...(request.moralOpinions || {}) },
			relationships: {},
			memories: [],
			quests: [],
			conflicts: [],
			injury: null,
			status: 'active',
			leadershipPotential: request.leadershipPotential || 40
		};
	}

	record(companion, memory) {
		return {
			...companion,
			memories: [...companion.memories, { ...memory }].slice(-24),
			loyalty: clamp(companion.loyalty + (memory.loyaltyDelta || 0))
		};
	}

	delegate(companion, role, policy) {
		if (companion.status !== 'active' || companion.injury?.severe) {
			throw new Error('CompanionService: companion is unavailable');
		}
		const highImpact = [
			'court-ruling',
			'treaty-signature',
			'budget-transfer',
			'irreversible-construction'
		];
		return {
			companionId: companion.id,
			role,
			allowedActions: [...policy.allowedActions],
			blockedActions: highImpact.filter(action => {
				return !policy.emergencyAllowedActions?.includes(action);
			}),
			reportRequired: true,
			expiresAtMinute: policy.expiresAtMinute
		};
	}

	retire(companion, reason) {
		return {
			...companion,
			status: 'retired',
			retirementReason: reason
		};
	}
}

function clamp(value) {
	return Math.max(0, Math.min(100, Math.round(value)));
}
