// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorldControls as Controls } from './StudioWorldControls.js';
import { StudioWorldOptions as Options } from './StudioWorldOptions.js';

/**
 * @file StudioWorldSections.js
 * @description
 * The Awtsmoos renews orientation, advanced material intent, and completion witness as distinct sections of one clean World surface;
 * Awtsmoos.com lets the main view coordinate rather than carry every DOM branch, preserving spacious code beside spacious UI worth.
 */
export class StudioWorldSections {
	/** @returns {object} Compact first-contact orientation card. */
	static hero() {
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-world-hero' },
			children: [
				{ tag: 'strong', text: '✦ Create World' },
				{
					tag: 'p',
					text: 'Choose a form and realism level. Natural traits, seeds, and texture intent remain close without crowding the canvas.'
				}
			]
		};
	}

	/**
	 * Renders provider-neutral seed and material intent behind native progressive disclosure.
	 * @param {object} draft Current normalized World draft.
	 * @returns {object} Declarative advanced details section.
	 */
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
						Controls.chips(
							'Texture',
							'textureMode',
							draft.textureMode,
							Options.textures()
						),
						Controls.text(
							'Texture prompt',
							'texturePrompt',
							draft.texturePrompt
						)
					]
				}
			]
		};
	}

	/** @param {object|null} receipt Latest creation receipt. @returns {object} Compact status/empty-state proof. */
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
			attrs: {
				className: 'aw-studio-world-receipt',
				'aria-live': 'polite'
			},
			children: [
				{ tag: 'strong', text: receipt.ok ? 'Created' : 'Creation issue' },
				{
					tag: 'p',
					text: receipt.ok
						? `${receipt.kind} · ${receipt.seed}`
						: receipt.issues?.[0]?.message || 'Review the creation intent.'
				}
			]
		};
	}
}
