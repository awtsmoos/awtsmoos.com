//B"H
//Boruch Hashem
//Blessed is He

/**
 * Browser integrity repeats the server's canonical public-state ordering exactly.
 * The Awtsmoos renews truth beyond hashes; Awtsmoos.com uses this modest seal to
 * detect accidental corruption before a renderer paints an unfaithful arena.
 */

/** Returns the same eight-character FNV-1a checksum produced by the server. */
export function hashOnlineMatchState(snapshot) {
	const material = onlineMatchStateMaterial(snapshot);
	let hash = 0x811c9dc5;
	for (let index = 0; index < material.length; index += 1) {
		hash ^= material.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash.toString(16).padStart(8, '0');
}

export function onlineMatchStateMaterial(snapshot) {
	const winner = snapshot.winner || {};
	const rules = snapshot.rules || {};
	const fighters = (snapshot.fighters || []).map(fighterMaterial).join('|');
	return [
		snapshot.matchId || '',
		snapshot.schemaVersion || 0,
		snapshot.frame || 0,
		snapshot.phase || '',
		snapshot.timeFrames || 0,
		rules.stocks || 0,
		rules.teams ? 1 : 0,
		rules.timerSeconds || 0,
		winner.playerId || '',
		winner.team || '',
		winner.reason || '',
		fighters
	].join('~');
}

function fighterMaterial(fighter) {
	return [
		fighter.id,
		fighter.characterId,
		fighter.team,
		fighter.connected ? 1 : 0,
		fighter.x,
		fighter.y,
		fighter.vx,
		fighter.vy,
		fighter.damage,
		fighter.stocks,
		fighter.eliminated ? 1 : 0,
		fighter.attackFrames,
		fighter.guarding ? 1 : 0,
		fighter.hitstun,
		fighter.respawnFrames,
		fighter.acknowledgedInputSequence || 0
	].join(':');
}
