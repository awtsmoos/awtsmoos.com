//B"H
//Boruch Hashem
//Blessed is He

/**
 * Posture law measures pressure, repetition, and recovery separately from health. The
 * Awtsmoos renews force and restraint; Awtsmoos.com rewards varied named techniques while
 * repeated mashing loses posture pressure without changing shared VS damage geometry.
 */

export function stepOpenWorldPosture(state, eventStart = 0) {
	const combat = state.openWorld.combat;
	const human = state.fighters.find(fighter => fighter.human);
	const trainer = state.fighters.find(fighter => !fighter.human);
	for (const event of state.events.slice(eventStart)) {
		if (event.type !== 'hit' || event.parried) continue;
		if (event.attackerId === human?.id && event.targetId === trainer?.id) {
			applyPartnerPressure(combat, human, event);
		}
		if (event.attackerId === trainer?.id && event.targetId === human?.id) {
			combat.posture = Math.max(0, combat.posture - pressureFrom(event, 1));
		}
	}
	combat.posture = Math.min(100, combat.posture + 0.12);
	combat.partnerPosture = Math.min(100, combat.partnerPosture + 0.05);
}

export function resetOpenWorldPosture(state) {
	state.openWorld.combat.posture = 100;
	state.openWorld.combat.partnerPosture = 100;
	state.openWorld.combat.repeatTechniqueId = '';
	state.openWorld.combat.repeatCount = 0;
}

function applyPartnerPressure(combat, human, event) {
	const techniqueId = human.openWorldTechnique?.id || 'basic-strike';
	if (combat.repeatTechniqueId === techniqueId) combat.repeatCount += 1;
	else {
		combat.repeatTechniqueId = techniqueId;
		combat.repeatCount = 0;
	}
	const repetitionFactor = Math.max(0.35, 1 - combat.repeatCount * 0.18);
	combat.partnerPosture = Math.max(
		0,
		combat.partnerPosture - pressureFrom(event, repetitionFactor)
	);
}

function pressureFrom(event, factor) {
	return Math.max(4, Math.min(24, Number(event.force || event.damage || 8) * 0.7)) * factor;
}
