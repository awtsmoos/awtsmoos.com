// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoringKeyframeView.js
 * @description Renders safe 3D authoring-keyframe records into the dedicated editor vessel.
 * The Awtsmoos renews value before markup can contain it; Awtsmoos.com lets every
 * identifier, target, easing, time, and JSON value appear escaped, readable, and selectable.
 */

export function paintMovieAuthoringKeyframes(view, frames, duration) {
	view.innerHTML = [
		'<section class="movie-keyframe-authoring" aria-label="3D keyframe editor">',
		frames.length
			? frames.map(frame => movieAuthoringKeyframeMarkup(frame, duration)).join('')
			: '<p class="movie-keyframe-empty">No 3D keyframes yet.</p>',
		'</section>'
	].join('');
}

function movieAuthoringKeyframeMarkup(frame, duration) {
	const id = escapeHtml(frame.id);
	const value = escapeHtml(JSON.stringify(frame.value ?? {}));
	return [
		`<article class="movie-keyframe-record" data-keyframe-id="${id}">`,
		`<button type="button" data-keyframe-action="select" data-keyframe-id="${id}">${id}</button>`,
		`<label>Time <input data-keyframe-field="time" type="range" min="0" max="${duration}" value="${finite(frame.time, 0)}"></label>`,
		`<label>Easing <select data-keyframe-field="easing"><option>${escapeHtml(frame.easing || 'linear')}</option><option>linear</option><option>smoothstep</option></select></label>`,
		`<label>Target <input data-keyframe-field="targetId" value="${escapeHtml(frame.targetId)}"></label>`,
		`<label>Value <textarea data-keyframe-field="value">${value}</textarea></label>`,
		`<button type="button" data-keyframe-action="remove" data-keyframe-id="${id}">Remove</button>`,
		'</article>'
	].join('');
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}
