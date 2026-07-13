//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the stage story events vessel in this instant, revealing
 * its focused js stage narrative service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { storyLine } from './stageVoiceLines.js';
import {
	canSpeak,
	decayZoneHeat,
	ensureStageStory,
	recordRivalHit,
	recordZoneHeat,
	tickStoryCooldowns
} from './stageStoryMemory.js';

/**
 * B"H
 * Stage story event detector.
 *
 * Chapter 87: the bard now watches clusters, pings, and AI roles in addition
 * to raw impacts. The story can say: everyone heard, a brawl ignited, a runner
 * broke for the rune, a hunter entered the storm.
 */
export function stepStageStory(state) {
	const story = ensureStageStory(state);
	tickStoryCooldowns(story);
	decayZoneHeat(story);
	markStageCounters(state, story);
	markResourcePing(state, story);
	markClusters(state, story);
	markRoles(state, story);
	markDanger(state, story);
	markEvents(state, story, [...state.events]);
	markDominance(state, story);
}

function markStageCounters(state, story) {
	const counts = stageCounts(state);
	compareCounter(state, story, counts, 'itemsSpawned', 'relicSpawn');
	compareCounter(state, story, counts, 'itemsPickedUp', 'relicClaim');
	compareCounter(state, story, counts, 'hazardsSpawned', 'hazardSpawn');
	compareCounter(state, story, counts, 'hazardHits', 'hazardHit');
	compareCounter(state, story, counts, 'objectiveSpawns', 'objectiveOpen');
	compareCounter(state, story, counts, 'objectiveClaims', 'objectiveClaim');
	story.lastCounts = counts;
}

function markResourcePing(state, story) {
	if (!state.resourcePing?.frames || state.resourcePing.frames < 330) return;
	speak(state, story, 'resourcePing', state.resourcePing.x, state.resourcePing.y - 110, 260);
}

function markClusters(state, story) {
	const hot = state.fightClusters?.[0];
	if (!hot || hot.heat < 95 || hot.members.length < 3) return;
	if (story.lastClusterId === hot.id && hot.heat < (story.lastClusterHeat || 0) + 22) return;
	story.lastClusterId = hot.id;
	story.lastClusterHeat = hot.heat;
	speak(state, story, 'clusterIgnite', hot.x, hot.y - 145, 320);
}

function markRoles(state, story) {
	if (state.frame % 150 !== 0) return;
	for (const f of state.fighters) {
		const role = f.aiMind?.role?.name;
		if (!role || f.dead || f.hidden) continue;
		if (role === 'ResourceRunner') speak(state, story, 'roleRunner', f.x, f.y - 130, 360);
		if (role === 'Hunter' && f.aiMind?.antiWander?.active)
			speak(state, story, 'roleHunter', f.x, f.y - 130, 360);
	}
}

function compareCounter(state, story, counts, key, line) {
	if ((counts[key] || 0) <= (story.lastCounts[key] || 0)) return;
	const p = centerOfBattle(state);
	speak(state, story, line, p.x, p.y - 130, 150);
}

function markEvents(state, story, events) {
	for (const e of events) {
		if (e.type !== 'hit') continue;
		recordZoneHeat(story, state, e.x || 0, e.y || 0, Math.max(1, (e.force || 0) / 12));
		if (e.attackerId && e.targetId && e.attackerId !== 'stage') markRivalry(state, story, e);
		if ((e.force || 0) >= 34 && !e.rapid) speak(state, story, 'heavyHit', e.x, e.y - 42, 120);
		if ((e.force || 0) >= 48 || e.koDanger || e.fullCharge)
			speak(state, story, 'launchHit', e.x, e.y - 72, 170);
		if (e.attackerId === 'stage') speak(state, story, 'hazardHit', e.x, e.y - 60, 90);
	}
}

function markRivalry(state, story, e) {
	const result = recordRivalHit(story, e.attackerId, e.targetId);
	if (result.revenge) speak(state, story, 'revenge', e.x, e.y - 88, 200);
	if (result.rivalry) speak(state, story, 'rivalry', e.x, e.y - 116, 280);
}

function markDanger(state, story) {
	for (const f of state.fighters) {
		if (f.dead || f.hidden || f.damage < 125 || story.danger.has(f.id)) continue;
		story.danger.add(f.id);
		speak(state, story, f.stocks <= 1 ? 'lastStand' : 'danger', f.x, f.y - 128, 160);
	}
}

function markDominance(state, story) {
	if (state.frame % 180 !== 0) return;
	let best = null;
	for (const [key, zone] of Object.entries(story.zoneHeat))
		if (!best || zone.heat > best.heat) best = { key, ...zone };
	if (!best || best.heat < 24) return;
	speak(
		state,
		story,
		'dominance',
		best.x / Math.max(1, best.samples),
		best.y / Math.max(1, best.samples) - 90,
		360
	);
}

function speak(state, story, name, x, y, cooldown) {
	if (!canSpeak(story, name, cooldown)) return;
	const line = storyLine(name);
	state.events.push({
		type: 'narrative',
		x,
		y,
		text: line.text,
		color: line.color,
		storyBeat: name
	});
}

function stageCounts(state) {
	const d = state.stageDirector || {};
	return {
		itemsSpawned: d.itemsSpawned || 0,
		itemsPickedUp: d.itemsPickedUp || 0,
		hazardsSpawned: d.hazardsSpawned || 0,
		hazardHits: d.hazardHits || 0,
		objectiveSpawns: d.objectiveSpawns || 0,
		objectiveClaims: d.objectiveClaims || 0
	};
}

function centerOfBattle(state) {
	const alive = state.fighters.filter(f => !f.dead && !f.hidden);
	if (!alive.length) return { x: 0, y: 0 };
	return {
		x: alive.reduce((s, f) => s + f.x, 0) / alive.length,
		y: alive.reduce((s, f) => s + f.y, 0) / alive.length
	};
}
