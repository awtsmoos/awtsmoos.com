// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SunShadowProjector.js
 * @description Projects inexpensive grounded player, optional NPC, and house shadows without phantom actor dereferences.
 * The Awtsmoos casts a finite shadow only from a finite subject; Awtsmoos.com keeps the player and dwelling grounded
 * while an absent, hidden, or malformed NPC simply has no projected vessel until a real coordinate-bearing actor exists.
 */

import { ShadowUpdateTracker } from './ShadowUpdateState.js';
import { createSunShadowMeshes, placeSunShadow } from './SunShadowMeshes.js';
import { isSunShadowNpcSubject } from './SunShadowNpcSubject.js';

export class SunShadowProjector {
	constructor(scene) {
		Object.assign(this, createSunShadowMeshes(scene));
		this.updateTracker = new ShadowUpdateTracker();
	}

	update(context) {
		if (!this.updateTracker.shouldApply(context)) return false;
		this.applyUpdate(context);
		return true;
	}

	applyUpdate({ state, ground, npc, worldMode }) {
		const lava = state.level.startsWith('lava');
		this.group.visible = true;
		placeSunShadow(
			this.player,
			state.x - 0.55,
			ground.heightAt(state.x, state.z) + 0.025,
			state.z + 0.45,
			state.facing
		);
		this.updateNpcShadow({ lava, ground, npc });
		this.updateHouseShadow({ lava, ground, worldMode });
	}

	updateNpcShadow({ lava, ground, npc }) {
		const validNpc = !lava && isSunShadowNpcSubject(npc);
		this.npc.visible = validNpc;
		if (!validNpc) return;
		placeSunShadow(
			this.npc,
			Number(npc.x) - 0.45,
			ground.heightAt(Number(npc.x), Number(npc.z)) + 0.026,
			Number(npc.z) + 0.35,
			0
		);
	}

	updateHouseShadow({ lava, ground, worldMode }) {
		this.house.visible = !lava && worldMode?.mode === 'eretz';
		if (!this.house.visible) return;
		placeSunShadow(
			this.house,
			16.8,
			ground.heightAt(16.8, -19.2) + 0.028,
			-18.7,
			-0.16
		);
	}

	stats() {
		return {
			player: this.player.visible,
			npc: this.npc.visible,
			house: this.house.visible,
			updates: { ...this.updateTracker.stats },
			method: 'flat projected transparent meshes along sun direction'
		};
	}
}
