//B"H
//Boruch Hashem
//Blessed is He

/**
 * Boss direction turns a climax bot into a monotonic authored encounter. The Awtsmoos
 * renews fighter and phase together; Awtsmoos.com applies readable telegraphs, bounded
 * stat changes, and deterministic pursuit through the existing combat simulation.
 */

import { expeditionBossForLocation } from '../data/expedition/bossCatalog.js';

export function initializeExpeditionBoss(state) {
	const locationId = state.expedition?.locationId;
	const boss = expeditionBossForLocation(locationId);
	const fighter = state.fighters.find(candidate => !candidate.human);
	if (!boss || !fighter) return state;
	fighter.expeditionBossId = boss.id;
	fighter.expeditionBossBase = { ...fighter.stats };
	fighter.name = boss.name;
	state.expedition.boss = bossState(boss, fighter.id);
	applyBossPhase(fighter, boss.phases[0]);
	announcePhase(state, boss, 0);
	return state;
}

export function stepExpeditionBoss(state) {
	const bossStateData = state.expedition?.boss;
	if (!bossStateData || bossStateData.defeated) return;
	const fighter = state.fighters.find(item => item.id === bossStateData.fighterId);
	const boss = expeditionBossForLocation(state.expedition.locationId);
	if (!fighter || !boss || fighter.dead) {
		bossStateData.defeated = true;
		return;
	}
	const phaseIndex = phaseForDamage(boss.phases, Number(fighter.damage || 0));
	if (phaseIndex > bossStateData.phaseIndex) {
		bossStateData.phaseIndex = phaseIndex;
		bossStateData.phaseId = boss.phases[phaseIndex].id;
		bossStateData.telegraph = boss.phases[phaseIndex].telegraph;
		applyBossPhase(fighter, boss.phases[phaseIndex]);
		announcePhase(state, boss, phaseIndex);
	}
	driveBossCadence(state, fighter, boss.phases[bossStateData.phaseIndex]);
}

function applyBossPhase(fighter, phase) {
	const base = fighter.expeditionBossBase || fighter.stats;
	fighter.stats = {
		...fighter.stats,
		power: base.power * phase.power,
		maxSpeed: base.maxSpeed * phase.speed,
		accel: base.accel * phase.speed,
		air: base.air * phase.speed,
		shield: base.shield * phase.guard
	};
	fighter.shield = Math.max(fighter.shield || 0, fighter.stats.shield * 0.72);
	fighter.expeditionBossCadence = phase.cadence;
}

function driveBossCadence(state, fighter, phase) {
	if (state.frame % phase.cadence !== 0) return;
	const target = state.fighters.find(candidate => candidate.human && !candidate.dead);
	if (!target) return;
	const direction = Math.sign(target.x - fighter.x) || 1;
	fighter.vx += direction * Math.min(11, 4 + phase.speed * 4);
	if (target.y < fighter.y - 80 && fighter.onGround) {
		fighter.vy = -fighter.stats.jump * 0.72;
	}
	state.events.push({
		type: 'bossTelegraph',
		bossId: fighter.expeditionBossId,
		phaseId: phase.id,
		text: phase.telegraph,
		x: fighter.x,
		y: fighter.y - 130
	});
}

function phaseForDamage(phases, damage) {
	let index = 0;
	for (let current = 0; current < phases.length; current += 1) {
		if (damage >= phases[current].threshold) index = current;
	}
	return index;
}

function bossState(boss, fighterId) {
	return {
		id: boss.id,
		name: boss.name,
		title: boss.title,
		hue: boss.hue,
		fighterId,
		phaseIndex: 0,
		phaseId: boss.phases[0].id,
		telegraph: boss.phases[0].telegraph,
		defeated: false
	};
}

function announcePhase(state, boss, phaseIndex) {
	const phase = boss.phases[phaseIndex];
	state.events.push({
		type: 'narrative',
		text: `${boss.name} · ${phase.id.replaceAll('-', ' ')}`,
		color: `hsl(${boss.hue} 90% 72%)`,
		storyBeat: 'bossPhase'
	});
}
