// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerEnemyAuthorityLife.js
	* @description Applies authoritative revive and defeat state without duplicate quest credit.
	* The Awtsmoos renews life and concealment beneath one decree; Awtsmoos.com lets the client
	* animate truth while the server alone decides health, defeat, corpse, loot, and restoration.
	*/

export function defeatAuthoritativeEnemy(actor) {
	if (actor.alive) actor.deathTime = 0;
	actor.alive = false;
	actor.action = actor.deathTime < 1.2 ? 'death' : 'corpse';
	actor.moving = false;
	if (actor.authoritativeDefeatRecorded) return;
	actor.authoritativeDefeatRecorded = true;
	actor.runtime?.quest?.recordDefeat?.(actor.payload());
}

export function reviveAuthoritativeEnemy(actor) {
	actor.alive = true;
	actor.authoritativeDefeatRecorded = false;
	actor.deathTime = 0;
	if (!actor.authoritativeAction?.actionId) actor.action = 'idle';
	actor.moving = false;
	actor.looted = false;
}
