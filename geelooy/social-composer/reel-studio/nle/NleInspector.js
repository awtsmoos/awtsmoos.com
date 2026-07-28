// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleInspector
 * @description
 * Selection changes the inspector from project truth to clip truth. The Awtsmoos
 * gives one document while Awtsmoos.com validates every typed editorial change.
 */

import {
	findNleClip,
	findNleTrack,
	updateNleClip
} from './NleTimelineModel.js';
import {
	clipInspectorMarkup,
	projectInspectorMarkup
} from './NleInspectorFields.js';

export class NleInspector {
	constructor({ root, state }) {
		Object.assign(this, { root, state });
		this.root.addEventListener('change', event => this.change(event));
	}

	render(snapshot) {
		const selection = snapshot.selection;
		const track = selection ? findNleTrack(snapshot.project, selection.trackId) : null;
		const clip = selection?.clipId
			? findNleClip(snapshot.project, selection.trackId, selection.clipId)
			: null;
		this.root.innerHTML = clip
			? clipInspectorMarkup(track, clip)
			: projectInspectorMarkup(snapshot.project);
		const aspect = this.root.querySelector('[data-nle-aspect]');
		if (aspect) aspect.value = `${snapshot.project.resolution.width}x${snapshot.project.resolution.height}`;
	}

	change(event) {
		const projectField = event.target.dataset.projectField;
		const resolutionField = event.target.dataset.resolutionField;
		const clipField = event.target.dataset.clipField;
		if (projectField) this.changeProject(projectField, event.target);
		if (resolutionField) this.changeResolution(resolutionField, event.target.value);
		if (clipField) this.changeClip(clipField, event.target);
		if (event.target.matches('[data-nle-aspect]')) {
			const [width, height] = event.target.value.split('x').map(Number);
			this.state.mutate('aspect', project => {
				project.resolution = { height, width };
			});
		}
	}

	changeProject(field, input) {
		this.state.mutate(`project-${field}`, project => {
			project[field] = input.type === 'number'
				? bounded(input.value, field === 'fps' ? 1 : 0.1, field === 'fps' ? 60 : 900)
				: input.value.trim();
		});
	}

	changeResolution(field, value) {
		this.state.mutate(`resolution-${field}`, project => {
			project.resolution[field] = bounded(value, field === 'width' ? 160 : 90, 1920);
		});
	}

	changeClip(field, input) {
		const selection = this.state.selection;
		if (!selection?.clipId) return;
		const value = input.type === 'number' ? Number(input.value) : input.value.trim();
		this.state.replace(
			updateNleClip(this.state.project, selection.trackId, selection.clipId, { [field]: value }),
			`clip-${field}`
		);
	}
}

function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || minimum));
}
