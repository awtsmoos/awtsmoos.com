// B"H
/**
 * @file MovieActorDirector.js
 * @description Directs the real player and NPC models from actor timeline clips.
 */
import { lerpPoint } from './MovieEasing.js';
import { movieFloorAt } from './MovieFloorResolver.js';

export function movieNpcCapability(runtime) {
	const npc = runtime?.npc;
	if (!npc || typeof npc !== 'object') return null;
	if (!Number.isFinite(Number(npc.x)) || !Number.isFinite(Number(npc.z))) {
		return null;
	}
	if (typeof npc.model?.position?.set !== 'function') return null;
	if (typeof npc.model?.quaternion?.set !== 'function') return null;
	return npc;
}

function animationName(runtime, target, requested) {
	const player = target === 'player'
		? runtime.player
		: movieNpcCapability(runtime)?.player;
	const names = player?.names || [];
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
		const npc = movieNpcCapability(runtime);
		if (npc) return Math.atan2(npc.x - point.x, npc.z - point.z);
		return Number(runtime.state?.facing || 0);
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
		const npc = movieNpcCapability(runtime);
		const npcFloor = npc ? movieFloorAt(runtime, npc.x, npc.z).y : 0;
		this.npcFootOffset = npc
			? Number(npc.model.position.y || 0) - npcFloor
			: 0;
	}

	apply(actorStates, deltaTime) {
		for (const state of actorStates) {
			if (state.track.target === 'player') this.applyPlayer(state);
			if (state.track.target === 'npc') this.applyNpc(state);
		}
		this.runtime.player?.update?.(deltaTime);
		movieNpcCapability(this.runtime)?.player?.update?.(deltaTime);
		this.runtime.model?.updateWorldMatrix?.();
		movieNpcCapability(this.runtime)?.model?.updateWorldMatrix?.();
	}

	applyPlayer(state) {
		const { runtime } = this;
		const point = desiredPoint(state);
		const floor = movieFloorAt(runtime, point.x, point.z);
		const baseY = floor.y + runtime.footOffset;
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
		runtime.state.movieFloor = floor;
		runtime.model.position.set(point.x, runtime.state.y, point.z);
		runtime.model.quaternion.set(0, Math.sin(runtime.state.facing / 2), 0, Math.cos(runtime.state.facing / 2));
		this.play('player', runtime.player, animationName(runtime, 'player', state.clip.animation));
	}

	applyNpc(state) {
		const { runtime } = this;
		const npc = movieNpcCapability(runtime);
		if (!npc) return false;
		const point = desiredPoint(state);
		const floor = movieFloorAt(runtime, point.x, point.z);
		const y = floor.y + this.npcFootOffset;
		npc.x = point.x;
		npc.z = point.z;
		npc.model.position.set(point.x, y, point.z);
		const facing = facingFor(runtime, 'npc', state, point);
		npc.model.quaternion.set(0, Math.sin(facing / 2), 0, Math.cos(facing / 2));
		this.play('npc', npc.player, animationName(runtime, 'npc', state.clip.animation));
		return true;
	}

	play(key, player, name) {
		if (
			!name
			|| typeof player?.play !== 'function'
			|| this.currentAnimations.get(key) === name
		) return;
		player.play(name);
		this.currentAnimations.set(key, name);
	}
}
