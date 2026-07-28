// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleTimelineElements
 * @description
 * Safe ruler, track, and clip elements reveal one measured movie without mixing
 * DOM assembly into the timeline controller.
 */

export function createNleRuler(duration, zoom) {
	const element = document.createElement('div');
	element.className = 'nle-ruler';
	element.dataset.nleRuler = '';
	element.style.width = `${Math.max(320, duration * zoom)}px`;
	const step = zoom >= 60 ? 1 : zoom >= 24 ? 2 : 5;
	for (let time = 0; time <= duration; time += step) {
		const mark = document.createElement('span');
		mark.style.left = `${time * zoom}px`;
		mark.textContent = `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
		element.append(mark);
	}
	return element;
}

export function createNleTrackRow(track, snapshot) {
	const row = document.createElement('section');
	row.className = `nle-track nle-track-${safeType(track.type)}`;
	row.dataset.trackId = track.id;
	const label = document.createElement('button');
	label.type = 'button';
	label.className = 'nle-track-label';
	label.dataset.nleTrackSelect = track.id;
	label.innerHTML = `<span aria-hidden="true">${trackIcon(track.type)}</span><strong></strong><small></small>`;
	label.querySelector('strong').textContent = track.id;
	label.querySelector('small').textContent = `${track.type} · ${(track.clips || []).length}`;
	const lane = document.createElement('div');
	lane.className = 'nle-track-lane';
	lane.dataset.nleLane = track.id;
	lane.style.width = `${Math.max(320, snapshot.project.duration * snapshot.zoom)}px`;
	for (const clip of track.clips || []) lane.append(createNleClipElement(track, clip, snapshot));
	row.append(label, lane);
	return row;
}

function createNleClipElement(track, clip, snapshot) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'nle-timeline-clip';
	button.dataset.clipId = clip.id;
	button.dataset.trackId = track.id;
	button.style.left = `${clip.start * snapshot.zoom}px`;
	button.style.width = `${Math.max(14, clip.duration * snapshot.zoom)}px`;
	button.toggleAttribute(
		'aria-current',
		snapshot.selection?.trackId === track.id && snapshot.selection?.clipId === clip.id
	);
	const left = document.createElement('span');
	left.className = 'nle-trim-handle nle-trim-start';
	left.dataset.trimEdge = 'start';
	const copy = document.createElement('span');
	copy.className = 'nle-clip-copy';
	copy.textContent = clip.label || clip.id;
	const right = document.createElement('span');
	right.className = 'nle-trim-handle nle-trim-end';
	right.dataset.trimEdge = 'end';
	button.append(left, copy, right);
	return button;
}

function safeType(value) {
	return String(value || 'track').replace(/[^a-z0-9-]+/gi, '-');
}

function trackIcon(type) {
	if (type.includes('audio')) return '♫';
	if (type.includes('camera')) return '◉';
	if (type.includes('overlay') || type === 'dialogue') return 'T';
	if (type.includes('visual') || type === 'scene') return '▧';
	if (type === 'actor') return '♙';
	return '◇';
}
