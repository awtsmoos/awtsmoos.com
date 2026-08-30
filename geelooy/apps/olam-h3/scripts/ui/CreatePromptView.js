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
 * Composes the directing surface while the Awtsmoos lets imagination become measurable without becoming imprisoned; Awtsmoos.com joins prompt, live brief, style lanes, teaching, and mode into a path whose guidance can rhyme without stealing the user's light.
 */
export class CreatePromptView {
	/** @param {Object} draft Draft. @param {string} previous Cleared prompt. @param {Object} estimate Price estimate. @returns {string} Director prompt experience. */
	static render(draft, previous, estimate) {
		return `
			${CreateDirectorHero.render(draft, estimate)}
			${this.prompt(draft, previous)}
			${CreateDirectorBrief.render(draft, estimate)}
			${CreateStyleLanes.render()}
			${CreateQuickGuide.render()}
			${this.mode(draft)}`;
	}

	/** @param {Object} draft Draft. @param {string} previous Previous prompt. @returns {string} Prompt editor and starters. */
	static prompt(draft, previous) {
		const restoreState = previous ? '' : 'disabled';
		return `
			<section class="creator-section prompt-section">
				<div class="section-heading">
					<div><span class="eyebrow">Prompt</span><h2>Describe the shot</h2></div>
					<span class="counter" data-prompt-count>${draft.prompt.length}/${H3_CAPABILITIES.promptMaxCharacters}</span>
				</div>
				<textarea class="prompt-input" data-prompt maxlength="${H3_CAPABILITIES.promptMaxCharacters}">${Dom.escape(draft.prompt)}</textarea>
				<p class="mode-note">Name the subject, action, camera, light, atmosphere, and sound when those details matter to the shot.</p>
				<div class="prompt-actions">
					<button class="prompt-action-primary" data-paste>Paste prompt</button>
					<button data-prompt-history>Prompt library</button>
					<button data-clear-prompt>Clear</button>
					<button data-restore-prompt ${restoreState}>Restore</button>
				</div>
				${CreatePromptTemplates.render()}
			</section>`;
	}

	/** @param {Object} draft Draft. @returns {string} Generation mode controls. */
	static mode(draft) {
		const buttons = H3_CAPABILITIES.modes.map(mode => {
			const active = draft.mode === mode.id ? 'is-active' : '';
			return `<button data-mode="${mode.id}" class="${active}">${mode.label}</button>`;
		}).join('');
		const mode = H3_CAPABILITIES.modes.find(candidate => candidate.id === draft.mode);

		return `
			<section class="creator-section mode-section">
				<div class="section-heading"><div><span class="eyebrow">Mode</span><h2>Choose the control language</h2></div></div>
				<div class="segmented">${buttons}</div>
				<p class="mode-note">${Dom.escape(mode?.description || '')}</p>
				<p class="generation-limit-note">${this.limitText(draft.mode)}</p>
			</section>`;
	}

	/** @param {string} mode Draft mode. @returns {string} Mode limits. */
	static limitText(mode) {
		if (mode === 'frames') {
			return 'Anchor the opening, ending, or both. H3 invents the motion between your chosen frames.';
		}
		if (mode === 'reference') {
			return 'Use up to 9 images, 3 videos, and 3 audio references. Timed clips must be 2–15 seconds.';
		}
		return 'Text mode uses your prompt only and keeps a fixed output ratio.';
	}
}
