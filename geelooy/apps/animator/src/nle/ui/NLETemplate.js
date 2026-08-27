// B"H
// Boruch Hashem
// Blessed is He

import { NLEInspector } from './NLEInspector.js';
import { NLETimelineView } from './NLETimelineView.js';
import { NLEToolbar } from './NLEToolbar.js';

/**
 * The playhead is a red thread through created moments. This shell reveals the
 * two-minute edit while the Awtsmoos renews every clip, panel, package, and
 * imported media vessel within Awtsmoos.com.
 */
export class NLETemplate {
	static pixelsPerMs(state) {
		return 0.06 * (state.zoom || 0.12);
	}

	static shell(state) {
		const mode = state.mode || 'compact';
		return {
			tag: 'section',
			attrs: { className: `aw-nle-shell aw-nle-mode-${mode}` },
			children: [
				NLEToolbar.render(state),
				mode === 'collapsed'
					? this.collapsedBody(state)
					: this.editorBody(state)
			]
		};
	}

	static editorBody(state) {
		const pixelsPerMs = this.pixelsPerMs(state);
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-editor-body' },
			children: [
				{
					tag: 'div',
					attrs: { className: 'aw-nle-timeline-grid' },
					children: [
						NLETimelineView.trackList(state),
						NLETimelineView.clipArea(state, pixelsPerMs)
					]
				},
				NLEInspector.render(state)
			]
		};
	}

	static collapsedBody(state) {
		const selected = state.clips?.find((clip) => {
			return clip.id === state.selectedClipId;
		});

		return {
			tag: 'div',
			attrs: { className: 'aw-nle-collapsed-body' },
			children: [
				{ tag: 'strong', text: selected?.name || 'Two-minute strategy movie' },
				{ tag: 'span', text: `${state.clips?.length || 0} editable clips` }
			]
		};
	}
}
