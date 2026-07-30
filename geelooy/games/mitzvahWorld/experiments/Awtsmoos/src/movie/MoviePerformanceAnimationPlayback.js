// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAnimationPlayback.js
 * @description Resolves recorded animation state against the clips truly present on a performer.
 * The Awtsmoos reveals motion without claiming a garment that was never loaded; Awtsmoos.com
 * chooses exact clips, honest fallbacks, smooth transitions, and one-shot boundaries in truthful rhyme.
 */

export function applyMoviePerformanceAnimation(target, sample) {
	if (!sample) {
		return { accepted: false, reason: 'ANIMATION_SAMPLE_MISSING' };
	}
	const player = target.player
		|| target.runtime?.playerAnimation?.player
		|| target.runtime?.player;
	const names = player?.names || [];
	const clip = resolveMoviePerformanceClip(names, sample.clip, sample.state);
	if (!player?.play || !clip) {
		return {
			accepted: false,
			reason: 'ANIMATION_UNAVAILABLE',
			requested: sample.clip || sample.state
		};
	}
	const current = player.current?.name || player.currentName || null;
	if (current !== clip) {
		player.play(clip, {
			fadeDuration: Number(sample.fadeDuration) || 0.15,
			loop: sample.loop !== false,
			speed: Number(sample.speed) || 1,
			weight: Number(sample.weight) || 1
		});
	}
	return {
		accepted: true,
		clip,
		fallback: clip !== sample.clip
	};
}

export function resolveMoviePerformanceClip(names = [], requested, state) {
	if (requested && names.includes(requested)) {
		return requested;
	}
	const expression = expressionFor(state || requested);
	return names.find(name => expression.test(name))
		|| names.find(name => /stand|idle|neutral/i.test(name))
		|| names[0]
		|| null;
}

function expressionFor(state = '') {
	if (/run/i.test(state)) {
		return /run|jog/i;
	}
	if (/walk|move/i.test(state)) {
		return /walk|step|stroll/i;
	}
	if (/jump|land/i.test(state)) {
		return /jump|leap|land/i;
	}
	if (/crouch|kneel/i.test(state)) {
		return /crouch|kneel/i;
	}
	if (/turn/i.test(state)) {
		return /turn/i;
	}
	return /stand|idle|neutral/i;
}
