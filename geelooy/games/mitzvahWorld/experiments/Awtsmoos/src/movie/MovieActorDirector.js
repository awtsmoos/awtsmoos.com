// B"H
/**
 * @file MovieActorDirector.js
 * @description Directs the real player and NPC models from actor timeline clips.
 */
import { lerpPoint } from './MovieEasing.js';

function animationName(runtime, target, requested) {
	const player = target === 'player' ? runtime.player : runtime.npc.player;
	const names = player.names || [];
	const clips = runtime.clips || {};
	if (target === 'player' && clips[requested]) return clips[requested];
	const expressions = {
		idle: /stand|idle|neutral/i,
		walk: /walk/i,
		run: /run/i,
		jump: /jump|leap/i,
		talk: /hands-out|neutral|stand/i
	};
	return names.find((name) => expressions[requested]?.test(name)) || names[0] || '';
}

function worldFloor(runtime, x, z) {
	const ground = runtime.groundSampler.heightAt(x, z).y;
	const houses = runtime.terrain.stats.houseStats?.houses || [];
	const house = houses.find((item) => (
		Math.abs(x - item.x) <= item.width / 2 - 1
		&& Math.abs(z - item.z) <= item.depth / 2 - 1
	));
	return house ? Math.max(ground, house.floorY + .2) : ground;
}

function desiredPoint(state) {
	const clip = state.clip;
	if (clip.from && clip.to) return lerpPoint(clip.from, clip.to, state.eased);
	return { ...(clip.at || clip.to || clip.from || {}) };
}

function facingFor(runtime, target, state, point) {
	const clip = state.clip;
	if (clip.face === 'player') {
		return Math.atan2(runtime.state.x - point.x, runtime.state.z - point.z);
	}
	if (clip.face === 'npc') {
		return Math.atan2(runtime.npc.x - point.x, runtime.npc.z - point.z);
	}
	if (clip.from && clip.to) {
		return Math.atan2(clip.to.x - clip.from.x, clip.to.z - clip.from.z);
	}
	return target === 'player' ? runtime.state.facing : 0;
}

export class MovieActorDirector {
	constructor(runtime) {
		this.runtime = runtime;
		this.currentAnimations = new Map();
		this.npcFootOffset = runtime.npc.model.position.y
			- runtime.groundSampler.heightAt(runtime.npc.x, runtime.npc.z).y;
	}

	apply(actorStates, deltaTime) {
		for (const state of actorStates) {
			if (state.track.target === 'player') this.applyPlayer(state);
			if (state.track.target === 'npc') this.applyNpc(state);
		}
		this.runtime.player.update(deltaTime);
		this.runtime.npc.player.update(deltaTime);
		this.runtime.model.updateWorldMatrix();
		this.runtime.npc.model.updateWorldMatrix();
	}

	applyPlayer(state) {
		const { runtime } = this;
		const point = desiredPoint(state);
		const baseY = worldFloor(runtime, point.x, point.z) + runtime.footOffset;
		const jump = state.clip.action === 'jump'
			? Math.sin(Math.PI * state.progress) * Number(state.clip.height || 2)
			: 0;
		runtime.state.x = point.x;
		runtime.state.z = point.z;
		runtime.state.y = baseY + jump;
		runtime.state.renderY = runtime.state.y;
		runtime.state.facing = facingFor(runtime, 'player', state, point);
		runtime.state.moving = ['move', 'jump'].includes(state.clip.action);
		runtime.state.runMode = state.clip.animation === 'run';
		runtime.state.grounded = jump <= .001;
		runtime.model.position.set(point.x, runtime.state.y, point.z);
		runtime.model.quaternion.set(0, Math.sin(runtime.state.facing / 2), 0, Math.cos(runtime.state.facing / 2));
		this.play('player', runtime.player, animationName(runtime, 'player', state.clip.animation));
	}

	applyNpc(state) {
		const { runtime } = this;
		const point = desiredPoint(state);
		const y = worldFloor(runtime, point.x, point.z) + this.npcFootOffset;
		runtime.npc.x = point.x;
		runtime.npc.z = point.z;
		runtime.npc.model.position.set(point.x, y, point.z);
		const facing = facingFor(runtime, 'npc', state, point);
		runtime.npc.model.quaternion.set(0, Math.sin(facing / 2), 0, Math.cos(facing / 2));
		this.play('npc', runtime.npc.player, animationName(runtime, 'npc', state.clip.animation));
	}

	play(key, player, name) {
		if (!name || this.currentAnimations.get(key) === name) return;
		player.play(name);
		this.currentAnimations.set(key, name);
	}
}
