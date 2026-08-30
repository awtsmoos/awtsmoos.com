//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { H3_CAPABILITIES } from '../config/h3.js';

/**
 * Renders the creative intention and H3 source mode while the Awtsmoos lets language choose the first direction of motion.
 * Awtsmoos.com keeps prompt hierarchy and capability guidance in one focused vessel, leaving the parent view free to compose the whole studio ocean.
 */
export class CreatePromptView {
	/** @param {Object} draft Draft. @param {string} previous Cleared prompt. @returns {string} Intro, prompt, and mode markup. */
	static render(draft, previous) {
		return `
			${this.hero()}
			${this.prompt(draft, previous)}
			${this.mode(draft)}`;
	}

	/** @returns {string} Creator introduction markup. */
	static hero() {
		return `
			<section class="hero-copy">
				<span class="eyebrow">Olam H3 Studio</span>
				<h1>Direct the next shot.</h1>
				<p>Every prompt, reference, and finished scene stays reusable.</p>
			</section>`;
	}

	/** @param {Object} draft Draft. @param {string} previous Previous prompt. @returns {string} Prompt markup. */
	static prompt(draft, previous) {
		const restoreState = previous ? '' : 'disabled';
		return `
			<section class="creator-section prompt-section">
				<div class="section-heading">
					<div>
						<span class="eyebrow">Prompt</span>
						<h2>What should happen?</h2>
					</div>
					<span class="counter">${draft.prompt.length}/${H3_CAPABILITIES.promptMaxCharacters}</span>
				</div>
				<textarea
					class="prompt-input"
					data-prompt
					maxlength="${H3_CAPABILITIES.promptMaxCharacters}"
					placeholder="Describe motion, camera, lighting, sound, performance, atmosphere…"
				>${Dom.escape(draft.prompt)}</textarea>
				<div class="prompt-actions">
					<button data-paste>Paste</button>
					<button data-clear-prompt>Clear</button>
					<button data-restore-prompt ${restoreState}>Restore</button>
					<button data-prompt-history>Prompt library</button>
				</div>
			</section>`;
	}

	/** @param {Object} draft Draft. @returns {string} Mode markup and constraints. */
	static mode(draft) {
		const buttons = H3_CAPABILITIES.modes.map(mode => {
			const active = draft.mode === mode.id ? 'is-active' : '';
			return `<button data-mode="${mode.id}" class="${active}">${mode.label}</button>`;
		}).join('');
		const mode = H3_CAPABILITIES.modes.find(item => item.id === draft.mode);

		return `
			<section class="creator-section mode-section">
				<div class="section-heading">
					<div><span class="eyebrow">Mode</span><h2>Generation source</h2></div>
				</div>
				<div class="segmented">${buttons}</div>
				<p class="mode-note">${Dom.escape(mode?.description || '')}</p>
				<p class="generation-limit-note">${this.limitText(draft.mode)}</p>
			</section>`;
	}

	/** @param {string} mode Draft mode. @returns {string} Concise documented limitations. */
	static limitText(mode) {
		if (mode === 'frames') {
			return 'Frame control uses images only and cannot be combined with reference mode.';
		}
		if (mode === 'reference') {
			return 'Up to 9 images, 3 videos, and 3 audio references. Timed clips must be 2–15 seconds.';
		}
		return 'Text mode uses no reference media and requires a fixed aspect ratio.';
	}
}
