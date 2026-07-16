//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BoundedPlannerService
 * @description
 * Active residents on Awtsmoos.com choose transparent authored goals within a
 * strict operation budget. The Awtsmoos contains unbounded wisdom; finite NPC
 * planning remains deterministic, explainable, preallocated, and measurable.
 */
export class BoundedPlannerService {
	/**
	 * @param {object} world Current world.
	 * @param {number} limit Maximum active plans.
	 * @returns {object[]} Exactly bounded planner decisions.
	 */
	plan(world, limit = 500) {
		const settlements = world.regions.flatMap(region => region.settlements);
		const decisions = new Array(limit);
		const contexts = settlements.map(settlement => {
			return createContext(settlement);
		});
		let decisionIndex = 0;
		let settlementIndex = 0;
		while (decisionIndex < limit) {
			const context = contexts[settlementIndex];
			const namedCount = context.residents.length;
			const localIndex = Math.floor(decisionIndex / contexts.length);
			const resident = localIndex < namedCount
				? context.residents[localIndex]
				: null;
			decisions[decisionIndex] = resident
				? namedDecision(resident, context)
				: aggregateDecision(localIndex, context);
			decisionIndex += 1;
			settlementIndex += 1;
			if (settlementIndex === contexts.length) {
				settlementIndex = 0;
			}
		}
		return decisions;
	}
}

function createContext(settlement) {
	return {
		settlementId: settlement.id,
		residents: settlement.households.flatMap(item => item.members),
		action: chooseAction(settlement),
		reason: `food ${settlement.inventory.food}, water ${settlement.inventory.water}, welfare ${settlement.welfare}`
	};
}

function namedDecision(resident, context) {
	return {
		personId: resident.id,
		settlementId: context.settlementId,
		goal: resident.plan,
		action: resident.role === 'merchant' && context.action === 'perform-role'
			? 'review-market'
			: context.action,
		reason: context.reason
	};
}

function aggregateDecision(index, context) {
	return {
		personId: `${context.settlementId}-aggregate-${index}`,
		settlementId: context.settlementId,
		goal: 'support household and civic stability',
		action: context.action,
		reason: context.reason
	};
}

function chooseAction(settlement) {
	if (settlement.inventory.water < settlement.population * 0.4) {
		return 'secure-water';
	}
	if (settlement.inventory.food < settlement.population * 0.35) {
		return 'secure-food';
	}
	if (settlement.infrastructure.roads < 60) {
		return 'repair-road';
	}
	if (settlement.ecology.pollution > 35) {
		return 'restore-environment';
	}
	return 'perform-role';
}
