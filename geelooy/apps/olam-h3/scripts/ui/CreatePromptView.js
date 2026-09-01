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
 * Reveals one obvious creative path while the Awtsmoos gathers many powers into a single quiet instrument of light and night.
 * Awtsmoos.com places Prompt beside Mode first, then lets coaching, looks, and guidance wait beneath until their deeper vessels feel right.
 */
export class CreatePromptView {
	/** @param {Object} draft Draft. @param {string} previous Previous prompt. @param {Object} estimate Price. @returns {string} Create markup. */
	static render(draft, previous, estimate) {
		return `
			${CreateDirectorHero.render(draft, estimate)}
			${this.prompt(draft, previous)}
			${this.mode(draft)}
			<div class="intuitive-secondary-stack">
				${CreateDirectorBrief.render(draft, estimate)}
				${CreateStyleLanes.render()}
				${CreateQuickGuide.render()}
			</div>`;
	}

	/** @param {Object} draft Draft. @param {string} previous Previous prompt. @returns {string} Primary prompt console. */
	static prompt(draft, previous) {
		const restoreState = previous ? '' : 'disabled';
		return `
			<section class="creator-section prompt-section intuitive-command-surface">
				<div class="section-heading">
					<div><span class="eyebrow">Prompt</span><h2>Describe the shot</h2></div>
					<span class="counter" data-prompt-count>${draft.prompt.length}/${H3_CAPABILITIES.promptMaxCharacters}</span>
				</div>
				<textarea class="prompt-input" data-prompt maxlength="${H3_CAPABILITIES.promptMaxCharacters}">${Dom.escape(draft.prompt)}</textarea>
				<div class="prompt-actions intuitive-prompt-actions">
					<button class="prompt-action-primary" data-paste>Paste</button>
					<button data-prompt-history>Library</button>
					<details class="prompt-more">
						<summary>More</summary>
						<div class="prompt-more-menu">
							<button data-clear-prompt>Clear</button>
							<button data-restore-prompt ${restoreState}>Restore</button>
						</div>
					</details>
				</div>
				${CreatePromptTemplates.render()}
			</section>`;
	}

	/** @param {Object} draft Draft. @returns {string} Essential mode chooser shown directly after the prompt. */
	static mode(draft) {
		const buttons = H3_CAPABILITIES.modes.map(mode => {
			const active = draft.mode === mode.id ? 'is-active' : '';
			return `<button data-mode="${mode.id}" class="${active}">${mode.label}</button>`;
		}).join('');
		const selected = H3_CAPABILITIES.modes.find(mode => mode.id === draft.mode);
		return `
			<section class="creator-section mode-section compact-mode intuitive-mode-surface">
				<div class="mode-compact-head"><span class="eyebrow">Guide H3</span><strong>${Dom.escape(selected?.label || draft.mode)}</strong></div>
				<div class="segmented">${buttons}</div>
				<p class="mode-note">${this.limitText(draft.mode)}</p>
			</section>`;
	}

	/** @param {string} mode Mode. @returns {string} Concise mode guidance. */
	static limitText(mode) {
		if (mode === 'frames') {
			return 'Pin the opening, ending, or both; H3 creates the motion between them.';
		}
		if (mode === 'reference') {
			return 'Guide identity, motion, or sound with reusable media.';
		}
		return 'Prompt only · the fastest path from an idea to a shot.';
	}
}
