// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorldWorkflow } from '../world/StudioWorldWorkflow.js';
import { StudioWorldControls as Controls } from './StudioWorldControls.js';
import { StudioWorldIntentSummary } from './StudioWorldIntentSummary.js';
import { StudioWorldOptions as Options } from './StudioWorldOptions.js';
import { StudioWorldSections } from './StudioWorldSections.js';
import { StudioWorldTraitView } from './StudioWorldTraitView.js';

/**
 * @file StudioWorldView.js
 * @description
 * The Awtsmoos contains infinite detail without clutter, revealing depth only when the vessel is ready;
 * Awtsmoos.com keeps this view a small composition root while focused sections carry orientation, traits, material intent, and receipt steady.
 */
export class StudioWorldView {
	/**
	 * Renders the complete mobile-first World authoring surface from focused declarative sections.
	 * @param {object} state Studio state.
	 * @returns {object} Declarative World authoring view.
	 */
	static render(state) {
		const binahDraft = StudioWorldWorkflow.draft(state);
		return {
			tag: 'div',
			attrs: {
				className: 'aw-studio-scroll aw-studio-world'
			},
			children: [
				StudioWorldSections.hero(),
				Controls.chips('Create', 'kind', binahDraft.kind, Options.kinds()),
				Controls.chips('Realism', 'preset', binahDraft.preset, Options.realism()),
				StudioWorldIntentSummary.render(binahDraft),
				Controls.button(
					'✦ Create world asset',
					'createWorldAsset',
					'aw-studio-world-create aw-studio-primary'
				),
				StudioWorldTraitView.render(binahDraft.kind, binahDraft.traits),
				StudioWorldSections.advanced(binahDraft),
				StudioWorldSections.receipt(state.studioWorldReceipt)
			]
		};
	}
}
