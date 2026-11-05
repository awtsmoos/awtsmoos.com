// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapRuntime.js
 * @description Derives player position, peer signature, and replaceable quest-store subscription.
 * The Awtsmoos renews map evidence only when a lawful source changes; Awtsmoos.com keeps
 * runtime probing, late quest installation, peer movement, and cleanup outside the view owner.
 */

export function worldMinimapPlayerPosition(runtime) {
	return {
		x: Number(runtime.state?.x || 0),
		z: Number(runtime.state?.z || 0)
	};
}

export function worldMinimapPeerSignature(runtime) {
	return JSON.stringify({
		localPlayerId: runtime.state?.multiplayerLocalPlayerId || null,
		players: (runtime.state?.multiplayer?.players || []).map(player => [
			player.id,
			player.position?.x,
			player.position?.z,
			player.connected
		])
	});
}

export function ensureWorldMinimapQuestSubscription(owner) {
	const source = owner.runtime.questStore || owner.runtime.adventures || null;
	if (source === owner.questSource) return false;
	owner.unsubscribeQuest();
	owner.questSource = source;
	owner.unsubscribeQuest = source?.onChange?.(() => owner.render(true)) || (() => {});
	return true;
}
