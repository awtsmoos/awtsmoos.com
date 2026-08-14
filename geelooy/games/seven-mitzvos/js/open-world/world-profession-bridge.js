//B"H
//Boruch Hashem
//Blessed is He

import { ProfessionService } from '../professions/profession-service.js';
import { ProgressionService } from '../progression/progression-service.js';
import {
	civicFarmProfessionAward,
	honestMarketProfessionAward
} from './world-profession-awards.js';
import { WorldProfessionStore, professionProfileVersion } from './world-profession-store.js';

/**
 * @file world-profession-bridge.js
 * @description
 * The Awtsmoos renews validated deeds into persistent character skill without rewarding mere input;
 * Awtsmoos.com lets farming and commerce share one small award pipeline while evidence interpretation stays in a pure neighboring vessel.
 * This bridge owns profession/progression coordination and its dedicated save only, never civic or encounter authority.
 */
export class WorldProfessionBridge {
	constructor(options = {}) {
		this.professions = options.professions || new ProfessionService();
		this.progression = options.progression || new ProgressionService();
		this.store = options.store || new WorldProfessionStore();
		this.state = normalizeProfile(this.store.load(), this.progression);
	}

	/** Awards Farmer practice from an accepted canonical civic Farm construction. */
	recordCivicConstruction(result, context) {
		return this.applyAward(
			civicFarmProfessionAward(result, context),
			'no-accepted-farm-event'
		);
	}

	/** Awards Merchant practice from one completed, already-recorded Honest Market play. */
	recordMitzvahCompletion(outcome) {
		return this.applyAward(
			honestMarketProfessionAward(outcome),
			'no-accepted-market-completion'
		);
	}

	/** Returns an immutable diagnostic projection of persistent RuneScape-like skill state. */
	view() {
		return clone({
			...this.state,
			persistence: this.store.view()
		});
	}

	applyAward(award, missingReason) {
		if (!award) {
			return { awarded: false, reason: missingReason };
		}
		if (this.state.awardedActions.includes(award.actionKey)) {
			return {
				awarded: false,
				reason: 'already-awarded',
				actionKey: award.actionKey
			};
		}
		const current = this.state.professions[award.professionId] ||
			this.professions.create(award.professionId);
		const profession = this.professions.practice(current, award.practice);
		const progression = this.progression.award(
			this.state.progression,
			award.progression
		);
		this.state = {
			...this.state,
			professions: {
				...this.state.professions,
				[award.professionId]: profession
			},
			progression,
			awardedActions: [...this.state.awardedActions, award.actionKey]
		};
		const saved = this.store.save(this.state);
		return {
			awarded: true,
			actionKey: award.actionKey,
			experienceGained: profession.experience - current.experience,
			profession: clone(profession),
			progression: clone(progression),
			saved
		};
	}
}

function normalizeProfile(saved, progressionService) {
	return {
		version: professionProfileVersion(),
		professions: saved?.professions || {},
		progression: saved?.progression || progressionService.create(),
		awardedActions: [...(saved?.awardedActions || [])]
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

export const WORLD_PROFESSIONS = new WorldProfessionBridge();
