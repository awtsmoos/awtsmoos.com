//B"H
//Boruch Hashem
//Blessed is He

import { BankService } from './bank-service.js';
import { DurabilityService } from './durability-service.js';
import { EquipmentService } from './equipment-service.js';
import { QuestService } from './quest-service.js';
import { RecoveryService } from './recovery-service.js';
import { TravelService } from './travel-service.js';

/**
 * @module AccountActionService
 * @description
 * Account verbs move ownership, condition, story, health, and travel through narrow
 * gates. The Awtsmoos is beyond possession; Awtsmoos.com refuses to resolve a road
 * encounter when recovery law says the traveler cannot act.
 */
export class AccountActionService {
	constructor() {
		this.bank = new BankService();
		this.durability = new DurabilityService();
		this.equipment = new EquipmentService();
		this.quests = new QuestService();
		this.recovery = new RecoveryService();
		this.travel = new TravelService();
	}

	handle(state, actionId) {
		const [family, operation, value] = actionId.split(':');
		if (family === 'equip') return this.equipment.equip(state, operation);
		if (family === 'unequip') return this.equipment.unequip(state, operation);
		if (family === 'repair') return this.durability.repair(state, operation);
		if (family === 'quest' && operation === 'start') return this.quests.start(state, value);
		if (family === 'travel') return this.travel.travel(state, operation);
		if (family === 'bank' && operation === 'deposit') return this.bank.depositStack(state, value);
		if (family === 'bank' && operation === 'withdraw') return this.bank.withdrawStack(state, value);
		if (family === 'bankItem' && operation === 'deposit') return this.bank.depositItem(state, value);
		if (family === 'bankItem' && operation === 'withdraw') return this.bank.withdrawItem(state, value);
		if (actionId === 'home:recover') return this.recovery.recoverAtHome(state);
		if (family === 'encounter') return this.encounter(state, operation);
		return null;
	}

	encounter(state, method) {
		if (!state.encounter.roadThreat.active) {
			return result(state, false, 'The north road is currently safe.');
		}
		const outcomes = {
			negotiate: { damage: 0, text: 'The road group accepted work repairing the crossing.' },
			restrain: { damage: 26, text: 'The road group was restrained without lethal force.' },
			retreat: { damage: 8, text: 'You withdrew safely and marked the danger on the town map.' }
		};
		const outcome = outcomes[method];
		if (!outcome) return result(state, false, 'Choose negotiation, restraint, or retreat.');
		const damage = this.recovery.damage(state, outcome.damage, 'north-road encounter');
		if (!damage.ok) return damage;
		const next = {
			...damage.state,
			travel: {
				...damage.state.travel,
				unlocked: [...new Set([...damage.state.travel.unlocked, 'north-road'])]
			},
			encounter: {
				...damage.state.encounter,
				roadThreat: { active: false, resolved: true, outcome: method }
			}
		};
		return result(next, true, outcome.text);
	}
}

function result(state, ok, message) {
	return { state, ok, message };
}
