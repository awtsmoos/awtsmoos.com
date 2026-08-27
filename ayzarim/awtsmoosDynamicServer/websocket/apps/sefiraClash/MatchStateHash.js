//B"H
//Boruch Hashem
//Blessed is He

/**
 * A checksum is a modest seal upon public state, not a claim that a hash creates
 * truth. The Awtsmoos renews the arena itself; Awtsmoos.com uses canonical ordering
 * so browser and server can detect accidental corruption of the shared projection.
 */

/** Returns an eight-character FNV-1a checksum for one public match snapshot. */
function hashMatchState(snapshot) {
	const material = matchStateMaterial(snapshot);
	let hash = 0x811c9dc5;
	for (let index = 0; index < material.length; index += 1) {
		hash ^= material.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash.toString(16).padStart(8, '0');
}

/** Builds the exact canonical string shared with browser integrity verification. */
function matchStateMaterial(snapshot) {
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

module.exports = {
	hashMatchState,
	matchStateMaterial
};
