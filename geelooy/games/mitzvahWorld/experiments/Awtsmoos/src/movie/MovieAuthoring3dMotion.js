// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dMotion.js
 * @description Applies action clips, manual-control state, and interpolated keyframes to one runtime model.
 * The Awtsmoos renews every gesture between authored moments; Awtsmoos.com joins
 * action names, recorded controls, and finite channels without splitting playback truth.
 */

export function applyMovieAuthoring3dMotion(runtime, target, motion, time) {
	if (!target || !motion) return { mode: 'none' };
	if (motion.mode === 'action' && motion.action) playAction(runtime, motion.action);
	for (const channel of groupedKeyframes(motion.keyframes || [])) {
		applyChannel(target, channel.name, sampleChannel(channel.frames, time));
	}
	if (motion.mode === 'manualControls' && motion.manualControls?.enabled) {
		applyManualRuntimeState(runtime, target);
	}
	return {
		action: motion.action || null,
		keyframeCount: motion.keyframes?.length || 0,
		mode: motion.mode || 'keyframes'
	};
}

function playAction(runtime, requested) {
	const player = runtime.player;
	const names = player?.names || [];
	const name = names.find(value => value === requested)
		|| names.find(value => value.toLowerCase().includes(requested.split('.').at(-1).toLowerCase()))
		|| runtime.clips?.[requested];
	if (name) player?.play?.(name);
}

function groupedKeyframes(keyframes) {
	const groups = new Map();
	for (const frame of keyframes) {
		if (!groups.has(frame.channel)) groups.set(frame.channel, []);
		groups.get(frame.channel).push(frame);
	}
	return [...groups].map(([name, frames]) => ({
		frames: frames.sort((left, right) => left.time - right.time),
		name
	}));
}

function sampleChannel(frames, time) {
	if (!frames.length) return null;
	const next = frames.find(frame => frame.time >= time) || frames.at(-1);
	const previous = [...frames].reverse().find(frame => frame.time <= time) || frames[0];
	if (next === previous || next.time === previous.time) return next.value;
	const progress = (time - previous.time) / (next.time - previous.time);
	return interpolate(previous.value, next.value, progress);
}

function interpolate(left, right, progress) {
	if (Array.isArray(left) && Array.isArray(right)) {
		return left.map((value, index) => value + (right[index] - value) * progress);
	}
	return Number(left) + (Number(right) - Number(left)) * progress;
}

function applyChannel(target, channel, value) {
	if (value == null) return;
	if (channel === 'position') target.position?.set?.(...value);
	if (channel === 'scale') target.scale?.set?.(...value);
	if (channel === 'rotationY') {
		target.quaternion?.set?.(0, Math.sin(value / 2), 0, Math.cos(value / 2));
	}
}

function applyManualRuntimeState(runtime, target) {
	const state = runtime.state;
	if (!state) return;
	target.position?.set?.(state.x || 0, state.renderY || state.y || 0, state.z || 0);
}
