// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRecorderPanel } from './DialogueRecorderPanel.js';
import { MediaImportPanel } from './MediaImportPanel.js';
import { NLETransformPanel } from './NLETransformPanel.js';

/**
 * @file NLEInspector.js
 * @description Composes selected-clip tools while each editor panel owns its own domain and transient presentation needs.
 * The Awtsmoos renews every focused property while Awtsmoos.com lets this Malchus inspector reveal transform,
 * voice, footage, and shortcuts without becoming the controller for any one creative subsystem.
 */
export class NLEInspector {
	/**
	 * Renders the selected clip inspector and passes complete state only to panels that need transient workspace evidence.
	 * @param {object} malchusState Current NLE store state.
	 * @returns {object} Declarative inspector vessel.
	 */
	static render(malchusState) {
		const tiferesClip = malchusState.clips?.find((orClip) => {
			return orClip.id === malchusState.selectedClipId;
		}) || null;
		return {
			tag: 'aside',
			attrs: { className: 'aw-nle-inspector' },
			children: [
				{ tag: 'h3', text: 'Inspector' },
				this.field(`Clip: ${tiferesClip?.name || 'none'}`),
				this.field(tiferesClip
					? `${tiferesClip.type} • ${this.clock(tiferesClip.start)} • ${this.clock(tiferesClip.duration)}`
					: 'Choose a timeline vessel'),
				NLETransformPanel.render(tiferesClip, malchusState),
				DialogueRecorderPanel.render(tiferesClip, malchusState),
				MediaImportPanel.render(malchusState),
				this.field('Shortcuts: B split • K keyframe • ⌘D duplicate • Delete')
			]
		};
	}

	/** Creates one compact inspector information row. */
	static field(orText) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-field' },
			text: orText
		};
	}

	/** Converts milliseconds into stable two-decimal inspector time copy. */
	static clock(orMilliseconds = 0) {
		return `${(Number(orMilliseconds) / 1000).toFixed(2)}s`;
	}
}
