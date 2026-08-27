// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieActorDirector.js
 * @description Directs player and optional legacy NPC capabilities from actor timeline clips.
 * The Awtsmoos renews motion before quaternion or matrix can claim the flame;
 * Awtsmoos.com honors every real runtime vessel without inventing powers in its name.
 */

import { movieFloorAt } from './MovieFloorResolver.js';
import {
	hasMovieNpc,
	movieActorModel,
	movieActorPlayer,
	updateMovieActorRuntime
} from './MovieActorRuntime.js';
import {
	resolveMovieActorAnimation,
	resolveMovieActorFacing,
	resolveMovieActorPoint,
	resolveMovieNpcFootOffset,
	setMovieActorYaw
} from './MovieActorState.js';

export class MovieActorDirector {
	constructor(runtime) {
		this.runtime = runtime;
		this.currentAnimations = new Map();
		this.npcFootOffset = resolveMovieNpcFootOffset(runtime);
	}

	apply(actorStates, deltaTime) {
		for (const state of actorStates) {
			if (state.track.target === 'player') this.applyPlayer(state);
			if (state.track.target === 'npc') this.applyNpc(state);
		}
		updateMovieActorRuntime(this.runtime, deltaTime);
	}

	applyPlayer(state) {
		const { runtime } = this;
		const point = resolveMovieActorPoint(state);
		const floor = movieFloorAt(runtime, point.x, point.z);
		const baseY = floor.y + Number(runtime.footOffset || 0);
		const jump = state.clip.action === 'jump'
			? Math.sin(Math.PI * state.progress) * Number(state.clip.height || 2)
			: 0;
		const facing = resolveMovieActorFacing(runtime, 'player', state, point);
		runtime.state.x = point.x;
		runtime.state.z = point.z;
		runtime.state.y = baseY + jump;
		runtime.state.renderY = runtime.state.y;
		runtime.state.facing = facing;
		runtime.state.moving = ['move', 'jump'].includes(state.clip.action);
		runtime.state.runMode = state.clip.animation === 'run';
		runtime.state.grounded = jump <= 0.001;
		runtime.state.movieFloor = floor;
		movieActorModel(runtime, 'player')?.position?.set?.(
			point.x,
			runtime.state.y,
			point.z
		);
		setMovieActorYaw(movieActorModel(runtime, 'player'), facing);
		this.play(
			'player',
			movieActorPlayer(runtime, 'player'),
			resolveMovieActorAnimation(runtime, 'player', state.clip.animation)
		);
	}

	applyNpc(state) {
		const { runtime } = this;
		if (!hasMovieNpc(runtime)) return false;
		const point = resolveMovieActorPoint(state);
		const floor = movieFloorAt(runtime, point.x, point.z);
		const facing = resolveMovieActorFacing(runtime, 'npc', state, point);
		runtime.npc.x = point.x;
		runtime.npc.z = point.z;
		movieActorModel(runtime, 'npc')?.position?.set?.(
			point.x,
			floor.y + this.npcFootOffset,
			point.z
		);
		setMovieActorYaw(movieActorModel(runtime, 'npc'), facing);
		this.play(
			'npc',
			movieActorPlayer(runtime, 'npc'),
			resolveMovieActorAnimation(runtime, 'npc', state.clip.animation)
		);
		return true;
	}

	play(key, player, name) {
		if (!name || typeof player?.play !== 'function') return;
		if (this.currentAnimations.get(key) === name) return;
		player.play(name);
		this.currentAnimations.set(key, name);
	}
}

export function movieNpcCapability(runtime) {
	return hasMovieNpc(runtime) ? runtime.npc : null;
}
