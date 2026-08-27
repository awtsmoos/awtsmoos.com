// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioAiView
 * @description
 * The Awtsmoos renews imagination before suggestion can become consent, and consent before project change can become real;
 * Awtsmoos.com keeps AI/manual generation transparent through preview, apply, discard, and portable JSON the artist can still feel.
 */

/** Renders prompt planning and portable document JSON without destructive generation. */
export class StudioAiView {
	/** @returns {Object} The AI/project-data workspace specification. */
	static render(state) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-ai' },
			children: [
				{ tag: 'label', attrs: { htmlFor: 'aw-studio-prompt' }, text: '🧠 Scene direction' },
				this.prompt(state),
				this.previewButton(),
				this.preview(state),
				{ tag: 'label', attrs: { htmlFor: 'aw-studio-json' }, text: '📄 Editable project JSON' },
				this.jsonEditor(state),
				this.installButton(),
				this.note(state)
			]
		};
	}

	/** @returns {Object} Prompt textarea that records local draft text. */
	static prompt(state) {
		return {
			tag: 'textarea',
			attrs: { id: 'aw-studio-prompt', rows: 4 },
			on: { input: 'updatePrompt' },
			text: state.studioPrompt || ''
		};
	}

	/** @returns {Object} Non-destructive generation trigger. */
	static previewButton() {
		return {
			tag: 'button',
			attrs: { className: 'aw-studio-primary', type: 'button' },
			on: { click: 'generatePrompt' },
			text: '🧠 Preview scene plan'
		};
	}

	/** @returns {Object|null} Generated preview summary with explicit consent actions. */
	static preview(state) {
		const summary = state.studioPromptPreviewSummary;
		if (!summary) {
			return null;
		}
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-ai-preview', 'aria-label': 'Generated scene preview' },
			children: [
				{ tag: 'strong', text: `👁️ ${summary.title}` },
				{ tag: 'p', text: `${summary.entities} editable objects · ${summary.clips} timeline clips` },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-ai-preview-actions' },
					children: [
						this.action('✅ Apply plan', 'applyPrompt', 'aw-studio-primary'),
						this.action('🗑️ Discard', 'discardPrompt')
					]
				}
			]
		};
	}

	/** @returns {Object} Portable JSON editor retaining manual project control. */
	static jsonEditor(state) {
		return {
			tag: 'textarea',
			attrs: { id: 'aw-studio-json', rows: 12, spellcheck: 'false' },
			on: { input: 'rememberJson' },
			text: state.studioJsonText || ''
		};
	}

	/** @returns {Object} Explicit JSON install action. */
	static installButton() {
		return this.action('📥 Install JSON into project', 'installJson');
	}

	/** @returns {Object} Current validation error or portability guidance. */
	static note(state) {
		return state.studioJsonError
			? { tag: 'p', attrs: { className: 'aw-studio-error' }, text: `⚠️ ${state.studioJsonError}` }
			: { tag: 'p', attrs: { className: 'aw-studio-note' }, text: '✅ Preview is non-destructive. Applied plans remain ordinary editable project data.' };
	}

	/** @returns {Object} Reusable AI action button specification. */
	static action(text, eventName, className = '') {
		return {
			tag: 'button',
			attrs: { type: 'button', className },
			on: { click: eventName },
			text
		};
	}
}
