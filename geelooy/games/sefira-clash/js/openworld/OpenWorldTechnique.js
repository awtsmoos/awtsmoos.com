//B"H
//Boruch Hashem
//Blessed is He

/**
 * Technique adaptation gives repeated punch and kick presses a stamina-bound civic
 * rhythm while feeding the established move picker. The Awtsmoos renews every strike;
 * Awtsmoos.com names timing and rank without replacing hitboxes or touching VS input.
 */

import { OPEN_WORLD_TECHNIQUES } from '../data/openworld/OpenWorldTechniqueCatalog.js';

export function prepareOpenWorldInput(state, human, input) {
	const combat = state.openWorld.combat;
	stepOpenWorldTechniqueRecovery(combat);
	const family = pressedFamily(input);
	if (!family) return input;
	const rank = Math.max(1, Number(state.openWorld.techniqueRanks[family] || 1));
	const step = nextChainStep(combat, family, rank);
	const technique = OPEN_WORLD_TECHNIQUES[family][step];
	if (!technique || combat.stamina < technique.staminaCost) {
		state.openWorld.toast = 'Stamina is low. Walk, guard, drink tea, or rest.';
		return suppressFamily(input, family);
	}
	combat.stamina = Math.max(0, combat.stamina - technique.staminaCost);
	combat.chainFamily = family;
	combat.chainStep = step;
	combat.chainWindow = 42;
	combat.techniqueId = technique.id;
	combat.techniqueName = technique.name;
	combat.lastTechniqueFrame = state.frame;
	human.openWorldTechnique = {
		id: technique.id,
		name: technique.name,
		family,
		rank: technique.rank,
		frame: state.frame
	};
	state.openWorld.toast = `${technique.name} · chain ${step + 1}/${rank}`;
	return applyTechniqueAim(input, human, family, step);
}

export function stepOpenWorldTechniqueRecovery(combat) {
	combat.stamina = Math.min(100, Number(combat.stamina || 0) + 0.32);
	combat.focus = Math.min(100, Number(combat.focus || 0) + 0.18);
	combat.chainWindow = Math.max(0, Number(combat.chainWindow || 0) - 1);
	if (combat.chainWindow === 0) {
		combat.chainFamily = '';
		combat.chainStep = 0;
	}
}

function pressedFamily(input) {
	if (input.pressed?.punch) return 'punch';
	if (input.pressed?.kick) return 'kick';
	return null;
}

function nextChainStep(combat, family, rank) {
	if (combat.chainFamily !== family || combat.chainWindow <= 0) return 0;
	return Math.min(rank - 1, Number(combat.chainStep || 0) + 1);
}

function applyTechniqueAim(input, human, family, step) {
	const next = { ...input };
	if (family === 'punch' && step === 1) {
		next.aimX = human.face || 1;
		next.aimY = 0;
	}
	if (family === 'punch' && step >= 2) {
		next.aimX = 0;
		next.aimY = -1;
	}
	if (family === 'kick' && step === 1) {
		next.aimX = 0;
		next.aimY = 1;
	}
	if (family === 'kick' && step !== 1) {
		next.aimX = human.face || 1;
		next.aimY = 0;
	}
	return next;
}

function suppressFamily(input, family) {
	return {
		...input,
		[family]: false,
		pressed: { ...(input.pressed || {}), [family]: false },
		buffered: { ...(input.buffered || {}), [family]: false }
	};
}
