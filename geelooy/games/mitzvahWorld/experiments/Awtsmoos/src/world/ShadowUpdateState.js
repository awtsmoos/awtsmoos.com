// B"H

/** Captures every exact input that changes the current projected shadow scene. */
export function captureShadowUpdateState({
	state,
	ground,
	npc,
	worldMode
}) {
	return {
		playerX: state?.x,
		playerZ: state?.z,
		playerFacing: state?.facing,
		playerLevel: state?.level,
		npcX: npc?.x,
		npcZ: npc?.z,
		npcVisible: npc?.group?.visible !== false,
		worldMode: worldMode?.mode,
		octree: ground?.octree,
		terrainHeightAt: ground?.terrainHeightAt
	};
}

/** Returns true when one visual or ground identity differs exactly. */
export function shadowUpdateStateChanged(previous, next) {
	if (!previous) return true;
	return previous.playerX !== next.playerX
		|| previous.playerZ !== next.playerZ
		|| previous.playerFacing !== next.playerFacing
		|| previous.playerLevel !== next.playerLevel
		|| previous.npcX !== next.npcX
		|| previous.npcZ !== next.npcZ
		|| previous.npcVisible !== next.npcVisible
		|| previous.worldMode !== next.worldMode
		|| previous.octree !== next.octree
		|| previous.terrainHeightAt !== next.terrainHeightAt;
}

/** Tracks exact shadow inputs and records every applied or skipped update. */
export class ShadowUpdateTracker {
	constructor() {
		this.previous = null;
		this.stats = { applied: 0, skipped: 0 };
	}

	shouldApply(context) {
		const next = captureShadowUpdateState(context);
		if (!shadowUpdateStateChanged(this.previous, next)) {
			this.stats.skipped += 1;
			return false;
		}
		this.previous = next;
		this.stats.applied += 1;
		return true;
	}
}
