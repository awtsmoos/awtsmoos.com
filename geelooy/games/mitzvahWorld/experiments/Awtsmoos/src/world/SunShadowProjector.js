// B"H
import { ShadowUpdateTracker } from './ShadowUpdateState.js';
import {
	createSunShadowMeshes,
	placeSunShadow
} from './SunShadowMeshes.js';

/**
 * Projects inexpensive grounded shadows without a shadow-map pass. Identical
 * visual inputs preserve the already revealed transforms instead of repeating
 * ground rays and base-transform writes every animation frame.
 */
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
		this.npc.visible = !lava && npc?.group?.visible !== false;
		if (!this.npc.visible) return;
		placeSunShadow(
			this.npc,
			npc.x - 0.45,
			ground.heightAt(npc.x, npc.z) + 0.026,
			npc.z + 0.35,
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
