//B"H
//Boruch Hashem
//Blessed is He

/**
 * Transient open-world state remembers scene, citizens, traversal, stamina, posture,
 * mission, and bounded telemetry without polluting persistent profile data. The Awtsmoos
 * renews every frame; Awtsmoos.com caps event memory before richness can threaten motion.
 */

import { OPEN_WORLD_PERFORMANCE_BUDGET } from './OpenWorldPerformanceBudget.js';
import { createOpenWorldTelemetry } from './OpenWorldPerformanceTelemetry.js';

export function createOpenWorldState(location, scenes, profile) {
	const remembered = profile.openWorld.lastStreetPositions[location.id] || null;
	return {
		locationId: location.id,
		locationName: location.name,
		regionId: location.regionId,
		sceneId: 'street',
		interiorId: null,
		scenes,
		nearby: null,
		prompt: '',
		overlay: null,
		returnPosition: remembered,
		safePosition: remembered || scenes.street.spawns[0],
		domainEvents: [],
		interactionPrevious: false,
		missionObjective: null,
		citizens: [],
		activeCitizens: [],
		nearbyCitizens: [],
		sleepingCitizenCount: 0,
		usedTraversalNodes: new Set(profile.openWorld.discoveredShortcuts || []),
		ambientParticles: [],
		speechBubbles: [],
		performance: createOpenWorldTelemetry(),
		techniqueRanks: {
			punch: Number(profile.openWorld.techniques.punchRank || 1),
			kick: Number(profile.openWorld.techniques.kickRank || 1)
		},
		combat: createOpenWorldCombatState(),
		toast: `${location.name}: overlap a doorway, citizen, or service and press E or Enter.`
	};
}

export function pushOpenWorldDomainEvent(state, event) {
	const queue = state.openWorld.domainEvents;
	queue.push({
		...event,
		locationId: event.locationId || state.openWorld.locationId,
		frame: state.frame
	});
	const overflow = queue.length - OPEN_WORLD_PERFORMANCE_BUDGET.maxDomainEvents;
	if (overflow > 0) queue.splice(0, overflow);
}

function createOpenWorldCombatState() {
	return {
		stamina: 100,
		focus: 100,
		posture: 100,
		partnerPosture: 100,
		parryWindow: 0,
		partnerTelegraph: '',
		chainFamily: '',
		chainStep: 0,
		chainWindow: 0,
		techniqueId: '',
		techniqueName: '',
		lastTechniqueFrame: -999,
		repeatTechniqueId: '',
		repeatCount: 0
	};
}
