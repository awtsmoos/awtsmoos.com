//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the stage mood vessel in this instant, revealing
 * its focused js stage events service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H - Stage mood from damage plus real stage activity. */
export function createStageMood(map) {
	const personality = moodName(map);
	return {
		personality,
		quietFrames: 0,
		chaos: baseChaos(map),
		violence: 0,
		restless: 0,
		lastDamage: 0,
		lastKoCount: 0,
		lastActivity: 0,
		objectiveBias: objectiveBias(map)
	};
}

/**
 * Reveals the update stage mood behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function updateStageMood(state) {
	state.stageMood ||= createStageMood(state.map);
	const mood = state.stageMood;
	const damage = totalDamage(state.fighters),
		kos = state.fighters.reduce((sum, f) => sum + (f.dead ? 1 : 0), 0),
		activity = stageActivity(state);
	const deltaDamage = Math.max(0, damage - mood.lastDamage),
		deltaKo = Math.max(0, kos - mood.lastKoCount),
		deltaActivity = Math.max(0, activity - (mood.lastActivity || 0));
	const p = state.map.personality || {};
	mood.quietFrames = deltaDamage > 0 || deltaActivity > 0 ? 0 : mood.quietFrames + 1;
	mood.violence = clamp(
		mood.violence * 0.992 +
			deltaDamage * (1.2 + (p.aggression || 5) * 0.08) +
			deltaKo * 30 +
			deltaActivity * 2,
		0,
		100
	);
	mood.chaos = clamp(
		mood.chaos * 0.996 +
			deltaDamage * 0.35 +
			deltaKo * 40 +
			deltaActivity * 1.5 +
			(p.chaos || 0) * 0.01,
		0,
		100
	);
	mood.restless = clamp(
		mood.restless * 0.995 + (mood.quietFrames > quietLimit(state.map) ? 0.55 : 0),
		0,
		100
	);
	mood.objectiveBias = objectiveBias(state.map) + (mood.quietFrames > 360 ? 20 : 0);
	mood.lastDamage = damage;
	mood.lastKoCount = kos;
	mood.lastActivity = activity;
	return mood;
}

function moodName(map) {
	const id = map.id || '',
		p = map.personality || {};
	if (id.includes('bouncer')) return 'netzach-vertical';
	if (id.includes('pinball')) return 'merkava-chaos';
	if (id.includes('vast')) return 'tiferes-control';
	if (p.objectivePressure >= 7) return 'tiferes-control';
	if (p.verticality >= 8) return 'netzach-vertical';
	if (p.chaos >= 9) return 'merkava-chaos';
	if (p.recoveryDifficulty >= 8) return 'gevurah-danger';
	if (p.itemDensity >= 8) return 'yesod-relics';
	return 'balanced';
}
function stageActivity(state) {
	const d = state.stageDirector || {};
	return (
		(d.itemsPickedUp || 0) +
		(d.objectiveClaims || 0) +
		(d.hazardHits || 0) +
		Math.floor((d.storyBeats || 0) / 3)
	);
}
function baseChaos(map) {
	return Math.min(28, (map.personality?.chaos || 0) * 2.4);
}
function objectiveBias(map) {
	return (map.personality?.objectivePressure || 4) * 8;
}
function quietLimit(map) {
	return map.id?.includes('vast') ? 300 : map.id?.includes('pinball') ? 240 : 420;
}
function totalDamage(fighters) {
	return fighters.reduce((sum, f) => sum + (f.damage || 0), 0);
}
function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
