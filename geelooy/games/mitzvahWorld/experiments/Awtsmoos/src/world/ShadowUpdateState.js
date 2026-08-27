// B"H // Boruch Hashem // Blessed is He

/**
 * @file ShadowUpdateState.js
 * @description Tracks every exact input that changes projected world shadows.
 * The Awtsmoos renews light across a stable collision vessel; Awtsmoos.com records
 * its revision so an atomic ownership handoff cannot leave old grounded projections.
 */

/** Captures every exact input that changes the current projected shadow scene. */
export function captureShadowUpdateState({
	state,
	ground,
	npc,
	worldMode
}) {
	const octree = ground?.octree;
	const octreeRevision = collisionRevisionFor(octree);
	return Object.freeze({
		playerX: state?.x,
		playerZ: state?.z,
		playerFacing: state?.facing,
		playerLevel: state?.level,
		npcX: npc?.x,
		npcZ: npc?.z,
		npcVisible: npc?.group?.visible !== false,
		worldMode: worldMode?.mode,
		octree,
		octreeRevision,
		terrainHeightAt: ground?.terrainHeightAt
	});
}

/** Returns true when one visual, collision revision, or ground identity differs. */
export function shadowUpdateStateChanged(previous, next) {
	if (!previous) {
		return true;
	}
	return previous.playerX !== next.playerX
		|| previous.playerZ !== next.playerZ
		|| previous.playerFacing !== next.playerFacing
		|| previous.playerLevel !== next.playerLevel
		|| previous.npcX !== next.npcX
		|| previous.npcZ !== next.npcZ
		|| previous.npcVisible !== next.npcVisible
		|| previous.worldMode !== next.worldMode
		|| previous.octree !== next.octree
		|| previous.octreeRevision !== next.octreeRevision
		|| previous.terrainHeightAt !== next.terrainHeightAt;
}

/** Tracks exact shadow inputs and records every applied or skipped update. */
export class ShadowUpdateTracker {
	constructor() {
		this.previous = null;
		this.stats = { applied: 0, skipped: 0 };
	}

	/** Returns whether the current context requires a fresh shadow projection. */
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

function collisionRevisionFor(octree) {
	const revision = octree?.revision;
	return revision === undefined
		? null
		: String(revision);
}
