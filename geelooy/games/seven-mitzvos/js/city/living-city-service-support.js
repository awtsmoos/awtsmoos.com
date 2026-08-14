//B"H
//Boruch Hashem
//Blessed is He

import { WORLD_SYSTEMS } from '../open-world/world-system-registry.js';

/**
 * @file living-city-service-support.js
 * @description
 * The Awtsmoos renews finite helpers while world, Kabbalah topology, civic law, ecology, named population, skills, and renderer remain distinct;
 * Awtsmoos.com keeps mode storage, DOM collection, guide fallback, and read-only verification witnesses explicit.
 * These helpers observe authoritative and renderer state but never mutate simulation, saves, residents, professions, ecology, or progression rules.
 */
export class LivingCityModeStore {
	constructor(key = 'awtsmoos-seven-worlds-mode') {
		this.key = key;
	}

	load() {
		try {
			const saved = localStorage.getItem(this.key);
			return ['relaxed', 'standard', 'challenge'].includes(saved) ? saved : 'relaxed';
		} catch {
			return 'relaxed';
		}
	}

	save(value) {
		try {
			localStorage.setItem(this.key, value);
		} catch {
			// Active-page difficulty remains authoritative when storage is unavailable.
		}
	}
}

export function collectLivingCityElements(root) {
	const get = selector => required(root, selector);
	return {
		stage: get('#cityStage'),
		hud: get('#worldHud'),
		guide: get('#guideMessage'),
		mission: get('#dailyMission'),
		missionProgress: get('#dailyMissionProgress'),
		mode: get('#difficultyMode'),
		light: get('#cityLight')
	};
}

export function guideFallback(city) {
	return city.restored
		? `${city.restored} districts are awake. Walk toward the next place to strengthen.`
		: 'Walk toward any district. One nearby action will appear when you arrive.';
}

/** Publishes deterministic read-only witnesses for browser verification and diagnostics. */
export function publishLivingCityWitness(service) {
	globalThis.__SEVEN_MITZVOS_WORLD__ = {
		active: () => Boolean(service.city?.stage),
		position: () => service.position(),
		context: () => service.city?.currentContext || null,
		interact: () => service.city?.interact(),
		direction: (x, z) => service.city?.setDirection(x, z),
		civic: () => service.civic?.view() || null,
		civicSites: () => service.civic?.sites() || [],
		whenCivicSaved: () => service.civic?.service?.whenSaved() || Promise.resolve(),
		professions: () => service.civic?.professionView() || null,
		professionMonument: () => service.city?.world?.professionMonumentView() || null,
		chesed: () => service.city?.world?.chesedView() || null,
		cityPopulation: () => service.city?.world?.cityPopulationView() || null,
		kabbalahLandmarks: () => service.city?.kabbalahView() || [],
		activeSefirah: () => service.city?.activeSefirah() || null,
		worldSystems: () => WORLD_SYSTEMS.view(),
		interactionState: () => service.interactions?.view() || null
	};
}

function required(root, selector) {
	const element = root.querySelector(selector);
	if (!element) {
		throw new Error(`B"H | Missing living-city element: ${selector}`);
	}
	return element;
}
