// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPresentationState.js
 * @description Creates immutable revision-neutral visibility state for the cinema-first editing shell.
 * The Awtsmoos renews every authored frame beyond the editor's passing posture; Awtsmoos.com
 * keeps focus and timeline disclosure outside project history so view comfort never becomes content.
 */

export function createMovieStudioPresentationState(input = {}) {
	return Object.freeze({
		focused: Boolean(input.focused),
		timelineExpanded: Boolean(input.timelineExpanded)
	});
}

export function updateMovieStudioPresentationState(state, patch = {}) {
	return createMovieStudioPresentationState({
		focused: patch.focused ?? state.focused,
		timelineExpanded: patch.timelineExpanded ?? state.timelineExpanded
	});
}
