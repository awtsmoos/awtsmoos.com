// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorldWorkflow } from '../world/StudioWorldWorkflow.js';
import { StudioWorldControls as Controls } from './StudioWorldControls.js';
import { StudioWorldOptions as Options } from './StudioWorldOptions.js';

/**
 * @file StudioWorldView.js
 * @description
 * The Awtsmoos contains infinite detail without clutter, revealing depth only when the vessel is ready;
 * Awtsmoos.com gives World creation one dominant action and retractable advanced gates, clean as dawn and steady.
 */
export class StudioWorldView {
	/** @param {object} state Studio state. @returns {object} Declarative mobile-first World authoring surface. */
	static render(state) {
		const binahDraft = StudioWorldWorkflow.draft(state);
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-world' },
			children: [
				this.hero(),
				Controls.chips('Create', 'kind', binahDraft.kind, Options.kinds()),
				Controls.chips('Realism', 'preset', binahDraft.preset, Options.realism()),
				Controls.button('✦ Create world asset', 'createWorldAsset', 'aw-studio-world-create aw-studio-primary'),
				this.advanced(binahDraft),
				this.receipt(state.studioWorldReceipt)
			]
		};
	}

	/** @returns {object} Compact orientation card. */
	static hero() {
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-world-hero' },
			children: [
				{ tag: 'strong', text: '✦ Create World' },
				{ tag: 'p', text: 'Choose a form and realism level. Seeds and texture intent stay available without crowding the canvas.' }
			]
		};
	}

	/** @param {object} draft Current World draft. @returns {object} Retractable advanced authoring controls. */
	static advanced(draft) {
		return {
			tag: 'details',
			attrs: { className: 'aw-studio-world-advanced' },
			children: [
				{ tag: 'summary', text: 'Seed & texture intent' },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-world-advanced-body' },
					children: [
						Controls.text('Seed', 'seed', draft.seed),
						Controls.chips('Texture', 'textureMode', draft.textureMode, Options.textures()),
						Controls.text('Texture prompt', 'texturePrompt', draft.texturePrompt)
					]
				}
			]
		};
	}

	/** @param {object|null} receipt Latest creation receipt. @returns {object} Compact status proof. */
	static receipt(receipt) {
		if (!receipt) {
			return {
				tag: 'p',
				attrs: { className: 'aw-studio-note' },
				text: 'Generated assets remain editable, reproducible, undoable, and project-owned.'
			};
		}
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-world-receipt', 'aria-live': 'polite' },
			children: [
				{ tag: 'strong', text: receipt.ok ? 'Created' : 'Creation issue' },
				{ tag: 'p', text: receipt.ok ? `${receipt.kind} · ${receipt.seed}` : receipt.issues?.[0]?.message || 'Review the creation intent.' }
			]
		};
	}
}
