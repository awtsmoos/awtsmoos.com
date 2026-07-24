//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmEventEngine
 * @description
 * Emergencies have warnings, role choices, resource costs, recovery, and lasting
 * consequences. The Awtsmoos creates occurrence; Awtsmoos.com returns one outcome
 * for the action engine to remember once rather than duplicating historical truth.
 */
const DEFINITIONS = Object.freeze([
	{ family: 'rescue', title: 'Lost traveler near the river', warning: 'A lantern was seen beyond the broken crossing.', actions: ['search', 'medicine'], skill: 'rescue' },
	{ family: 'fire', title: 'Workshop roof fire', warning: 'Smoke rises above the eastern homes.', actions: ['water', 'organize'], skill: 'construction' },
	{ family: 'shortage', title: 'Grain shortage', warning: 'Caravans cannot cross and market shelves are thinning.', actions: ['grain', 'negotiate'], skill: 'trade' },
	{ family: 'animal', title: 'Injured sanctuary animal', warning: 'A caretaker found tracks and blood near the orchard.', actions: ['medicine', 'calm'], skill: 'animalCare' }
]);

export class RealmEventEngine {
	advance(state, minutes = 1) {
		let next = { ...state, clock: advanceClock(state.clock, minutes) };
		if (!next.event && next.clock.minute >= next.nextEventMinute) next = this.start(next);
		return next;
	}

	start(state) {
		const definition = DEFINITIONS[state.eventIndex % DEFINITIONS.length];
		return {
			...state,
			event: {
				...definition,
				id: `realm-event-${state.eventIndex + 1}`,
				status: 'active',
				progress: 0,
				startedAt: state.clock.minute
			},
			eventIndex: state.eventIndex + 1,
			nextEventMinute: state.clock.minute + 18
		};
	}

	respond(state, actionId) {
		const event = state.event;
		if (!event || event.status !== 'active' || !event.actions.includes(actionId)) {
			return result(state, false, 'That response is unavailable.');
		}
		const cost = resourceCost(actionId);
		if (cost && (state.player.inventory[cost] || 0) < 1) {
			return result(state, false, `You need ${cost}.`);
		}
		const next = cost ? spend(state, cost) : state;
		const progress = event.progress + (actionId === event.actions[0] ? 2 : 1);
		const complete = progress >= 3;
		return result({
			...next,
			settlement: complete ? improveSettlement(next.settlement, event.family) : next.settlement,
			event: complete ? null : { ...event, progress }
		}, true, complete ? `${event.title} resolved through ${actionId}.` : `${actionId} advanced the response.`);
	}
}

function advanceClock(clock, minutes) {
	const minute = clock.minute + minutes;
	return { minute, day: Math.floor(minute / 1440) + 1 };
}

function resourceCost(action) {
	return { medicine: 'medicine', water: 'water', grain: 'grain' }[action] || '';
}

function spend(state, resource) {
	return {
		...state,
		player: {
			...state.player,
			inventory: { ...state.player.inventory, [resource]: state.player.inventory[resource] - 1 }
		}
	};
}

function improveSettlement(settlement, family) {
	const field = { rescue: 'health', fire: 'safety', shortage: 'food', animal: 'trust' }[family];
	return {
		...settlement,
		[field]: Math.min(100, settlement[field] + 8),
		trust: Math.min(100, settlement.trust + 3)
	};
}

function result(state, ok, message) {
	return { state, ok, message };
}
