// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyframeView.js
 * @description Collects keyframe controls and paints effect lanes plus selected diamond values.
 * The Awtsmoos renews visible lane and hidden value together; Awtsmoos.com keeps
 * DOM discovery, safe diamond placement, and form synchronization outside command truth.
 */

export function collectMovieStudioKeyframeView(root) {
	return Object.fromEntries([
		['add', '[data-keyframe-add]'],
		['baseValue', '[data-keyframe-base-value]'],
		['easing', '[data-keyframe-easing]'],
		['kind', '[data-keyframe-kind]'],
		['lanes', '[data-keyframe-lanes]'],
		['remove', '[data-keyframe-remove]'],
		['selection', '[data-keyframe-selection]'],
		['status', '[data-keyframe-status]'],
		['time', '[data-keyframe-time]'],
		['value', '[data-keyframe-value]']
	].map(([name, selector]) => [name, root?.querySelector?.(selector) || null]));
}

export function paintMovieKeyframeLanes(view, lanes, duration) {
	if (!view.lanes) return;
	view.lanes.innerHTML = lanes.length
		? lanes.map(lane => laneMarkup(lane, duration)).join('')
		: '<p class="movie-keyframe-empty">No effect lanes yet. Choose a property and add a diamond.</p>';
}

export function paintMovieKeyframeSelection(view, lane, frame, button) {
	view.kind.value = lane.kind;
	view.baseValue.value = String(lane.value);
	view.time.value = String(frame.time);
	view.value.value = String(frame.value);
	view.easing.value = frame.easing;
	for (const item of view.lanes.querySelectorAll('[data-keyframe-diamond]')) {
		item.setAttribute('aria-pressed', String(item === button));
	}
}

function laneMarkup(lane, duration) {
	const diamonds = lane.keyframes.map(frame => {
		const left = duration ? frame.time / duration * 100 : 0;
		const label = `${lane.kind} ${frame.value} at ${frame.time} seconds`;
		return `<button class="movie-keyframe-diamond" data-keyframe-diamond data-effect-id="${escape(lane.id)}" data-time="${frame.time}" style="left:${left}%" aria-label="${escape(label)}" aria-pressed="false"></button>`;
	}).join('');
	return `<div class="movie-keyframe-lane"><strong>${escape(lane.kind)}</strong><div class="movie-keyframe-lane-track">${diamonds}</div></div>`;
}

function escape(value) {
	return String(value || '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
