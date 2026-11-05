// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieActorState.js
 * @description Resolves actor points, facing, exact exported animations, semantic aliases, and grounded offsets.
 * The Awtsmoos creates motion before coordinates know they move; Awtsmoos.com preserves every Chossid clip by name,
 * while semantic requests still prefer living positive-duration movement over a static pose when both could answer.
 */

import { lerpPoint } from './MovieEasing.js';
import { movieFloorAt } from './MovieFloorResolver.js';
import {
	hasMovieNpc,
	movieActorPlayer
} from './MovieActorRuntime.js';

export function resolveMovieActorAnimation(runtime, target, requested) {
	const player = movieActorPlayer(runtime, target);
	const names = player?.names || [];
	const exact = names.find(name => name === requested);
	if (exact) return exact;
	const direct = target === 'player' ? runtime.clips?.[requested] : null;
	if (typeof direct === 'string' && direct) return direct;
	const expression = animationExpression(requested);
	if (!expression) return names[0] || '';
	return movingMatch(player, expression)
		|| names.find(name => expression.test(name))
		|| names[0]
		|| '';
}

export function resolveMovieActorPoint(state) {
	const { clip } = state;
	if (clip.from && clip.to) return lerpPoint(clip.from, clip.to, state.eased);
	return { ...(clip.at || clip.to || clip.from || {}) };
}

export function resolveMovieActorFacing(runtime, target, state, point) {
	const { clip } = state;
	if (clip.face === 'player') {
		return Math.atan2(runtime.state.x - point.x, runtime.state.z - point.z);
	}
	if (clip.face === 'npc' && hasMovieNpc(runtime)) {
		return Math.atan2(runtime.npc.x - point.x, runtime.npc.z - point.z);
	}
	if (clip.from && clip.to) {
		return Math.atan2(clip.to.x - clip.from.x, clip.to.z - clip.from.z);
	}
	return target === 'player' ? Number(runtime.state.facing || 0) : 0;
}

export function resolveMovieNpcFootOffset(runtime) {
	if (!hasMovieNpc(runtime)) return 0;
	const floor = movieFloorAt(runtime, runtime.npc.x, runtime.npc.z);
	return runtime.npc.model.position.y - floor.y;
}

export function setMovieActorYaw(model, facing) {
	model?.quaternion?.set?.(
		0,
		Math.sin(facing / 2),
		0,
		Math.cos(facing / 2)
	);
}

function animationExpression(requested) {
	return {
		dance: /dance/i,
		danceHipHop: /dance hip hop/i,
		danceSilly: /dance silly/i,
		fall: /fall|air|drop/i,
		handsOut: /hands-out/i,
		idle: /stand|idle|neutral/i,
		jump: /jump|leap/i,
		neutral: /neutral/i,
		punch: /punch/i,
		run: /run/i,
		stab: /stab/i,
		talk: /hands-out|neutral|stand/i,
		walk: /walk/i
	}[requested] || null;
}

function movingMatch(player, expression) {
	const clips = Array.isArray(player?.clips) ? player.clips : [];
	return clips.find(clip =>
		Number(clip?.duration) > 0.0005 && expression.test(String(clip?.name || ''))
	)?.name || '';
}
