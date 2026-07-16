//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldCommandRouter
 * @description
 * Player intention enters Awtsmoos.com through one named gate. The Awtsmoos
 * unifies every domain, while time, local travel, regional travel, economy,
 * and civic authority remain separately testable.
 */
import { WorldCommandHandlers } from './commands/world-command-handlers.js';
import { EconomyCommandHandlers } from './commands/economy-command-handlers.js';
import { CivicCommandHandlers } from './commands/civic-command-handlers.js';
import { simulationPreset } from './simulation-presets.js';

export class LivingWorldCommandRouter {
	/**
	 * @param {string|number} seed Stable world seed.
	 * @param {object} identities Authoritative identity factory.
	 */
	constructor(seed, identities) {
		const world = new WorldCommandHandlers(seed);
		const economy = new EconomyCommandHandlers();
		const civic = new CivicCommandHandlers(
			() => identities.next('case'),
			() => identities.next('treaty')
		);
		this.routes = {
			ADVANCE_TIME: world.advanceTime.bind(world),
			TRAVEL: world.travel.bind(world),
			TRAVEL_REGION: world.travelRegion.bind(world),
			BUY_RESOURCE: economy.buy.bind(economy),
			PRODUCE: economy.produce.bind(economy),
			CONSTRUCT: economy.construct.bind(economy),
			FILE_CASE: civic.fileCase.bind(civic),
			RULE_CASE: civic.ruleCase.bind(civic),
			CREATE_TREATY: civic.createTreaty.bind(civic),
			SET_PRESET: this.setPreset.bind(this)
		};
	}

	/**
	 * @param {object} state Current state.
	 * @param {object} command Validated command.
	 * @returns {object[]} Domain facts.
	 */
	route(state, command) {
		const handler = this.routes[command.type];
		if (!handler) {
			throw new Error(`LivingWorldCommandRouter: unsupported ${command.type}`);
		}
		return handler(state, command);
	}

	setPreset(state, command) {
		const preset = simulationPreset(command.payload.presetId);
		return [{ type: 'PRESET_CHANGED', payload: { presetId: preset.id } }];
	}
}
