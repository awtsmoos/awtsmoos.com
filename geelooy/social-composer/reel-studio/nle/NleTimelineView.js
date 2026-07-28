// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleTimelineView
 * @description
 * Every MitzvahWorld and extension track remains visible as timed evidence. Full
 * rows redraw only for edits; playhead movement remains a lightweight transform.
 */

import {
	createNleRuler,
	createNleTrackRow
} from './NleTimelineElements.js';

export class NleTimelineView {
	constructor({ root }) {
		this.root = root;
		this.playhead = null;
	}

	render(snapshot) {
		const width = Math.max(320, snapshot.project.duration * snapshot.zoom);
		this.root.style.setProperty('--nle-timeline-width', `${width}px`);
		this.root.replaceChildren(
			createNleRuler(snapshot.project.duration, snapshot.zoom),
			...snapshot.project.tracks.map(track => createNleTrackRow(track, snapshot))
		);
		this.playhead = document.createElement('div');
		this.playhead.className = 'nle-playhead';
		this.playhead.dataset.nlePlayhead = '';
		this.root.append(this.playhead);
		this.updatePlayhead(snapshot);
	}

	updatePlayhead(snapshot) {
		if (!this.playhead?.isConnected) return;
		this.playhead.style.transform = `translateX(${snapshot.playhead * snapshot.zoom}px)`;
	}
}
