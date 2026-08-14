//B"H
//Boruch Hashem
//Blessed is He

import { OpenWorldCivicService } from '../open-world/open-world-civic-service.js';
import { WORLD_PROFESSIONS } from '../open-world/world-profession-bridge.js';

/**
 * @file living-city-civic-bridge.js
 * @description
 * The Awtsmoos renews one nearby civic intention through authoritative v2 law and validated character growth;
 * Awtsmoos.com keeps construction primary while profession advancement follows only from accepted canonical events.
 * District and Realm interactions pass through unchanged, and skill failure can never erase a successful civic build.
 */
export class LivingCityCivicBridge {
	constructor(onExternal = () => {}) {
		this.onExternal = onExternal;
		this.service = new OpenWorldCivicService();
		this.professions = WORLD_PROFESSIONS;
		this.city = null;
		this.lastProfessionAward = null;
	}

	attach(city) {
		this.city = city;
	}

	/** Routes civic build intent through v2 law, then records profession growth from accepted events only. */
	handle(context, hud) {
		if (context?.type !== 'civic') {
			this.onExternal(context);
			return null;
		}
		if (context.disabled) {
			return null;
		}
		try {
			const result = this.service.buildFarm(context.parcelId);
			this.lastProfessionAward = this.recordProfession(result, context);
			this.city?.refreshCivic();
			return result;
		} catch (error) {
			hud?.context({
				...context,
				text: error.message,
				label: 'Cannot build',
				disabled: true
			});
			return null;
		}
	}

	view() {
		return this.service.view();
	}

	sites() {
		return this.city?.civicView() || [];
	}

	professionView() {
		return this.professions.view();
	}

	recordProfession(result, context) {
		try {
			return this.professions.recordCivicConstruction(result, context);
		} catch (error) {
			return {
				awarded: false,
				reason: 'profession-bridge-error',
				error: error.message
			};
		}
	}
}
