// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieActorDirector.js
 * @description Directs only actor capabilities actually exposed by the active world runtime.
 * The Awtsmoos renews player and creature beyond every adapter's name; Awtsmoos.com
 * preserves cinematic truth by moving real vessels and never crashing for an absent actor.
 */

import { movieFloorAt } from './MovieFloorResolver.js';
import {
	resolveMovieActorAnimation,
	resolveMovieActorFacing,
	resolveMovieActorPoint,
	resolveMovieNpcFootOffset,
	setMovieActorYaw
} from './MovieActorState.js';
import {
	hasMovieNpc,
	movieActorPlayer,
	updateMovieActorRuntime
} from './MovieActorRuntime.js';

export class MovieActorDirector {
	constructor(runtime) {
		this.runtime = runtime;
		this.currentAnimations = new Map();
		this.npcFootOffset = resolveMovieNpcFootOffset(runtime);
	}

	apply(actorStates, deltaTime) {
		for (const state of actorStates) {
			if (state.track.target === 'player') this.applyPlayer(state);
			if (state.track.target === 'npc' && hasMovieNpc(this.runtime)) {
				this.applyNpc(state);
			}
		}
		updateMovieActorRuntime(this.runtime, deltaTime);
	}

	applyPlayer(state) {
		const { runtime } = this;
		const point = resolveMovieActorPoint(state);
		const floor = movieFloorAt(runtime, point.x, point.z);
		const jump = state.clip.action === 'jump'
			? Math.sin(Math.PI * state.progress) * Number(state.clip.height || 2)
			: 0;
		const baseY = floor.y + Number(runtime.footOffset || 0);
		runtime.state.x = point.x;
		runtime.state.z = point.z;
		runtime.state.y = baseY + jump;
		runtime.state.renderY = runtime.state.y;
		runtime.state.facing = resolveMovieActorFacing(
			runtime,
			'player',
			state,
			point
		);
		runtime.state.moving = ['move', 'jump'].includes(state.clip.action);
		runtime.state.runMode = state.clip.animation === 'run';
		runtime.state.grounded = jump <= 0.001;
		runtime.state.movieFloor = floor;
		runtime.model?.position?.set?.(point.x, runtime.state.y, point.z);
		setMovieActorYaw(runtime.model, runtime.state.facing);
		this.play('player', resolveMovieActorAnimation(
			runtime,
			'player',
			state.clip.animation
		));
	}

	applyNpc(state) {
		const { runtime } = this;
		const point = resolveMovieActorPoint(state);
		const floor = movieFloorAt(runtime, point.x, point.z);
		const y = floor.y + this.npcFootOffset;
		runtime.npc.x = point.x;
		runtime.npc.z = point.z;
		runtime.npc.model.position.set(point.x, y, point.z);
		setMovieActorYaw(
			runtime.npc.model,
			resolveMovieActorFacing(runtime, 'npc', state, point)
		);
		this.play('npc', resolveMovieActorAnimation(
			runtime,
			'npc',
			state.clip.animation
		));
	}

	play(target, name) {
		if (!name || this.currentAnimations.get(target) === name) return;
		movieActorPlayer(this.runtime, target)?.play?.(name);
		this.currentAnimations.set(target, name);
	}
}
