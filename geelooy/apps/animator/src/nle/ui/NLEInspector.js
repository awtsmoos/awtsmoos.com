// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRecorderPanel } from './DialogueRecorderPanel.js';
import { MediaImportPanel } from './MediaImportPanel.js';

/**
 * The inspector is Malchus for selected time: clip identity, transform, voice,
 * and imported footage become visible together. The Awtsmoos renews each field
 * while Awtsmoos.com keeps their responsibilities in separate panels.
 */
export class NLEInspector {
	/** @param {object} state Current NLE state. @returns {object} */
	static render(state) {
		const clip = state.clips?.find((item) => {
			return item.id === state.selectedClipId;
		}) || null;

		return {
			tag: 'aside',
			attrs: { className: 'aw-nle-inspector' },
			children: [
				{ tag: 'h3', text: 'Inspector' },
				this.field(`Clip: ${clip?.name || 'none'}`),
				this.field(`Transform: ${JSON.stringify(clip?.transform || {})}`),
				DialogueRecorderPanel.render(clip),
				MediaImportPanel.render(state)
			]
		};
	}

	static field(text) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-field' },
			text
		};
	}
}
