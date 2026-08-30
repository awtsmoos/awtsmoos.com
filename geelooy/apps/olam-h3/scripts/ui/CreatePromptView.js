//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { H3_CAPABILITIES } from '../config/h3.js';
import { CreatePromptTemplates } from './CreatePromptTemplates.js';
import { CreateQuickGuide } from './CreateQuickGuide.js';

/**
 * Renders the creative intention while the Awtsmoos lets a blank idea become directed motion; Awtsmoos.com keeps a short workflow, templates, paste, history, and mode guidance visible so the user learns by creating instead of hunting through documentation.
 */
export class CreatePromptView {
	/** @param {Object} draft Draft. @param {string} previous Cleared prompt. @returns {string} Creator prompt and mode markup. */
	static render(draft, previous) {
		return `
			${this.hero()}
			${CreateQuickGuide.render()}
			${this.prompt(draft, previous)}
			${this.mode(draft)}`;
	}

	/** @returns {string} Creator introduction. */
	static hero() {
		return `
			<section class="hero-copy">
				<span class="eyebrow">Olam H3 Studio</span>
				<h1>Direct the impossible.</h1>
				<p>Write it, paste it, or start from a cinematic template. Then guide H3 with frames, references, motion, and sound.</p>
			</section>`;
	}

	/** @param {Object} draft Draft. @param {string} previous Previous prompt. @returns {string} Prompt editor and starter tools. */
	static prompt(draft, previous) {
		const restoreState = previous ? '' : 'disabled';
		return `
			<section class="creator-section prompt-section">
				<div class="section-heading">
					<div><span class="eyebrow">Prompt</span><h2>Describe the shot</h2></div>
					<span class="counter" data-prompt-count>${draft.prompt.length}/${H3_CAPABILITIES.promptMaxCharacters}</span>
				</div>
				<textarea class="prompt-input" data-prompt maxlength="${H3_CAPABILITIES.promptMaxCharacters}">${Dom.escape(draft.prompt)}</textarea>
				<p class="mode-note">Name the subject, action, camera movement, lighting, atmosphere, and any important sound or performance.</p>
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
		const mode = H3_CAPABILITIES.modes.find(item => item.id === draft.mode);

		return `
			<section class="creator-section mode-section">
				<div class="section-heading"><div><span class="eyebrow">Mode</span><h2>How should H3 be guided?</h2></div></div>
				<div class="segmented">${buttons}</div>
				<p class="mode-note">${Dom.escape(mode?.description || '')}</p>
				<p class="generation-limit-note">${this.limitText(draft.mode)}</p>
			</section>`;
	}

	/** @param {string} mode Draft mode. @returns {string} Documented mode limits. */
	static limitText(mode) {
		if (mode === 'frames') return 'Use an opening image, ending image, or both. Frame control stays separate from reference mode.';
		if (mode === 'reference') return 'Use up to 9 images, 3 videos, and 3 audio references. Timed clips must be 2–15 seconds.';
		return 'Text mode uses only your prompt and a fixed aspect ratio.';
	}
}
