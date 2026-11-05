// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowUpdateState.js
 * @description Tracks every exact input that changes projected world shadows without inventing absent NPC visibility.
 * The Awtsmoos renews light across one stable collision vessel; Awtsmoos.com records player, ground, world,
 * and only a real finite NPC subject so movement cannot awaken a phantom shadow from an undefined actor.
 */

import { isSunShadowNpcSubject } from './SunShadowNpcSubject.js';

export function captureShadowUpdateState({ state, ground, npc, worldMode }) {
	const octree = ground?.octree;
	const octreeRevision = collisionRevisionFor(octree);
	const npcVisible = isSunShadowNpcSubject(npc);
	return Object.freeze({
		playerX: state?.x,
		playerZ: state?.z,
		playerFacing: state?.facing,
		playerLevel: state?.level,
		npcX: npcVisible ? Number(npc.x) : null,
		npcZ: npcVisible ? Number(npc.z) : null,
		npcVisible,
		worldMode: worldMode?.mode,
		octree,
		octreeRevision,
		terrainHeightAt: ground?.terrainHeightAt
	});
}

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
		|| previous.octreeRevision !== next.octreeRevision
		|| previous.terrainHeightAt !== next.terrainHeightAt;
}

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

function collisionRevisionFor(octree) {
	const revision = octree?.revision;
	return revision === undefined ? null : String(revision);
}
