//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encounter law turns real hits into technique evidence and resolves training through
 * damage or posture break without stock victory. The Awtsmoos renews attacker and partner;
 * Awtsmoos.com preserves nonlethal reset, safe recovery, and mission evidence independently.
 */

import { resetOpenWorldPosture } from './OpenWorldPosture.js';
import { pushOpenWorldDomainEvent } from './OpenWorldState.js';

export function resolveOpenWorldEncounter(state, eventStart = 0) {
	state.winner = '';
	state.winnerId = null;
	const trainer = state.fighters.find(fighter => !fighter.human);
	const human = state.fighters.find(fighter => fighter.human);
	for (const event of state.events.slice(eventStart)) {
		if (!isTravelerHit(event, human, trainer)) continue;
		const technique = human.openWorldTechnique;
		if (!technique) continue;
		event.techniqueId = technique.id;
		event.techniqueName = technique.name;
		pushOpenWorldDomainEvent(state, {
			type: 'techniqueHit',
			targetId: technique.family,
			techniqueId: technique.id,
			count: 1
		});
	}
	const postureBroken = Number(state.openWorld.combat.partnerPosture || 0) <= 0;
	if (trainer && !trainer.hidden && (trainer.damage >= 100 || postureBroken)) {
		resolveTrainingPartner(state, trainer, postureBroken);
	}
	if (state.openWorld.combat.posture <= 0) resetTravelerPosture(state, human);
	recoverTraveler(state, human);
}

function isTravelerHit(event, human, trainer) {
	return event.type === 'hit' && event.attackerId === human?.id && event.targetId === trainer?.id;
}

function resolveTrainingPartner(state, trainer, postureBroken) {
	Object.assign(trainer, {
		damage: 0,
		stun: 0,
		vx: 0,
		vy: 0,
		x: state.map.spawns[1]?.x || 260,
		y: state.map.spawns[1]?.y || 500,
		dead: false,
		hidden: false,
		stocks: 99
	});
	resetOpenWorldPosture(state);
	state.openWorld.toast = postureBroken
		? 'Partner posture broken. The spar ended without exile.'
		: 'Measured spar resolved. No one was cast from the world.';
	state.events.push(narrativeEvent(trainer, postureBroken ? 'POSTURE BREAK' : 'SPAR RESOLVED'));
	pushOpenWorldDomainEvent(state, {
		type: 'resolveEncounter',
		targetId: 'training',
		count: 1
	});
}

function resetTravelerPosture(state, human) {
	state.openWorld.combat.posture = 100;
	state.openWorld.combat.focus = Math.max(20, state.openWorld.combat.focus - 20);
	if (human) {
		human.stun = Math.max(Number(human.stun || 0), 20);
		human.vx = 0;
		human.vy = 0;
	}
	state.openWorld.toast = 'Your posture broke. Recover before pressing again.';
}

function recoverTraveler(state, human) {
	if (!human) return;
	const bounds = state.map.bounds;
	const outside =
		human.x <= bounds.left ||
		human.x >= bounds.right ||
		human.y <= bounds.top ||
		human.y >= bounds.bottom;
	if (!outside && !human.dead && !human.respawnTimer) return;
	const point = state.openWorld.safePosition || state.map.spawns[0];
	Object.assign(human, {
		x: point.x,
		y: point.y,
		prevY: point.y,
		vx: 0,
		vy: 0,
		damage: Math.min(60, human.damage || 0),
		dead: false,
		hidden: false,
		respawnTimer: 0,
		stocks: 99
	});
}

function narrativeEvent(trainer, text) {
	return {
		type: 'narrative',
		x: trainer.x,
		y: trainer.y - 150,
		text,
		color: '#bdf8d0',
		storyBeat: 'openWorldSpar'
	};
}
