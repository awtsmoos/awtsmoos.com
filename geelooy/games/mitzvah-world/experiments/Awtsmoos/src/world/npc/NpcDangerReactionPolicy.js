// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcDangerReactionPolicy.js
 * @description Lets friendly neighbors notice danger, flee briefly, and later offer support.
 * The Awtsmoos renews every person as a whole; Awtsmoos.com keeps fear temporary,
 * dialogue resumable, and community response separate from hostile combat machinery.
 */

export function createNpcDangerReaction(threatPosition, nowSeconds, duration = 4) {
	return {
		activeUntil: nowSeconds + duration,
		supportUntil: 0,
		threatPosition: { ...threatPosition }
	};
}

export function createNpcSupportReaction(nowSeconds, duration = 3) {
	return {
		activeUntil: 0,
		supportUntil: nowSeconds + duration,
		threatPosition: null
	};
}

export function advanceNpcDangerMotion(actor, deltaTime, nowSeconds) {
	const reaction = actor.dangerReaction;
	if (!reaction?.threatPosition || nowSeconds >= reaction.activeUntil) return false;
	const offsetX = actor.worldX - reaction.threatPosition.x;
	const offsetZ = actor.worldZ - reaction.threatPosition.z;
	const length = Math.max(0.001, Math.hypot(offsetX, offsetZ));
	const speed = actor.profile.dangerSpeed || 2.8;
	actor.worldX += offsetX / length * speed * deltaTime;
	actor.worldZ += offsetZ / length * speed * deltaTime;
	actor.worldY = actor.ground.heightAt(actor.worldX, actor.worldZ) + actor.footOffset;
	actor.model.position.set(actor.worldX, actor.worldY, actor.worldZ);
	return true;
}

export function npcReactionState(actor, nowSeconds) {
	if (nowSeconds < Number(actor.dangerReaction?.activeUntil || 0)) return 'fleeing';
	if (nowSeconds < Number(actor.dangerReaction?.supportUntil || 0)) return 'supporting';
	return 'calm';
}
