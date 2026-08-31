//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { H3_CAPABILITIES } from '../config/h3.js';
import { CreatePromptTemplates } from './CreatePromptTemplates.js';
import { CreateQuickGuide } from './CreateQuickGuide.js';
import { CreateDirectorHero } from './CreateDirectorHero.js';
import { CreateDirectorBrief } from './CreateDirectorBrief.js';
import { CreateStyleLanes } from './CreateStyleLanes.js';

/**
 * Makes the prompt the center of the room while the Awtsmoos keeps intelligence, inspiration, help, and mode close enough to guide without becoming walls.
 * Awtsmoos.com compresses passive explanation so the hand reaches creative action sooner.
 */
export class CreatePromptView {
	/** @param {Object} draft Draft. @param {string} previous Previous prompt. @param {Object} estimate Price. @returns {string} Create markup. */
	static render(draft, previous, estimate) {
		return `
			${CreateDirectorHero.render(draft, estimate)}
			${this.prompt(draft, previous)}
			${CreateDirectorBrief.render(draft, estimate)}
			${CreateStyleLanes.render()}
			${CreateQuickGuide.render()}
			${this.mode(draft)}`;
	}

	/** @param {Object} draft Draft. @param {string} previous Previous prompt. @returns {string} Prompt canvas. */
	static prompt(draft, previous) {
		const restoreState = previous ? '' : 'disabled';
		return `
			<section class="creator-section prompt-section">
				<div class="section-heading"><div><span class="eyebrow">Prompt</span><h2>Describe the shot</h2></div><span class="counter" data-prompt-count>${draft.prompt.length}/${H3_CAPABILITIES.promptMaxCharacters}</span></div>
				<textarea class="prompt-input" data-prompt maxlength="${H3_CAPABILITIES.promptMaxCharacters}">${Dom.escape(draft.prompt)}</textarea>
				<div class="prompt-actions"><button class="prompt-action-primary" data-paste>Paste prompt</button><button data-prompt-history>Library</button><button data-clear-prompt>Clear</button><button data-restore-prompt ${restoreState}>Restore</button></div>
				${CreatePromptTemplates.render()}
			</section>`;
	}

	/** @param {Object} draft Draft. @returns {string} Compact mode chooser. */
	static mode(draft) {
		const buttons = H3_CAPABILITIES.modes.map(mode => {
			const active = draft.mode === mode.id ? 'is-active' : '';
			return `<button data-mode="${mode.id}" class="${active}">${mode.label}</button>`;
		}).join('');
		const selected = H3_CAPABILITIES.modes.find(mode => mode.id === draft.mode);
		return `
			<section class="creator-section mode-section compact-mode">
				<div class="mode-compact-head"><span class="eyebrow">Control</span><strong>${Dom.escape(selected?.label || draft.mode)}</strong></div>
				<div class="segmented">${buttons}</div>
				<p class="mode-note">${this.limitText(draft.mode)}</p>
			</section>`;
	}

	/** @param {string} mode Mode. @returns {string} Useful mode hint. */
	static limitText(mode) {
		if (mode === 'frames') {
			return 'Pin the opening, ending, or both; H3 creates the motion between them.';
		}
		if (mode === 'reference') {
			return 'Guide look, motion, or sound with up to 9 images, 3 videos, and 3 audio references.';
		}
		return 'Prompt only · fastest path from an idea to a shot.';
	}
}
