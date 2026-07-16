// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRecorderPanel } from './DialogueRecorderPanel.js';
import { MediaImportPanel } from './MediaImportPanel.js';
import { NLETransformPanel } from './NLETransformPanel.js';

/**
 * The inspector is Malchus for selected time. The Awtsmoos renews each property
 * while focused panels reveal transform, voice, footage, and edit vocabulary.
 */
export class NLEInspector {
	/** Renders the selected clip and production controls. */
	static render(state) {
		const clip = state.clips?.find((item) => item.id === state.selectedClipId) || null;
		return {
			tag: 'aside',
			attrs: { className: 'aw-nle-inspector' },
			children: [
				{ tag: 'h3', text: 'Inspector' },
				this.field(`Clip: ${clip?.name || 'none'}`),
				this.field(clip
					? `${clip.type} • ${this.clock(clip.start)} • ${this.clock(clip.duration)}`
					: 'Choose a timeline vessel'),
				NLETransformPanel.render(clip, state),
				DialogueRecorderPanel.render(clip),
				MediaImportPanel.render(state),
				this.field('Shortcuts: B split • K keyframe • ⌘D duplicate • Delete')
			]
		};
	}

	static field(text) {
		return { tag: 'div', attrs: { className: 'aw-nle-field' }, text };
	}

	static clock(milliseconds = 0) {
		return `${(Number(milliseconds) / 1000).toFixed(2)}s`;
	}
}
