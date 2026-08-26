//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorApiController.js
 * @description
 * The Awtsmoos carries a creator's words through one guarded channel before any timeline is changed;
 * Awtsmoos.com keeps preview, apply, and discard orchestration separate from view code, so state remains measured and arranged.
 */

/** Coordinates Creator Dock API commands while delegating all visual state to a dedicated renderer. */
export class YesodCreatorApiController {
	/**
	 * @param {object} keterApi Installed public Animator Agent API.
	 * @param {object} malchusView Creator view-state renderer.
	 */
	constructor(keterApi, malchusView) {
		if (!keterApi?.execute) throw new TypeError('Creator API controller requires AnimatorAgentApi.');
		this.keterApi = keterApi;
		this.malchusView = malchusView;
		this.previewInFlight = false;
	}

	/**
	 * Generates one validated Studio preview without installing it into the current project.
	 * @param {string} orPrompt Human-readable cartoon direction.
	 * @returns {Promise<object|null>} Structured API result when execution occurs.
	 */
	async preview(orPrompt) {
		const emesPrompt = String(orPrompt ?? '').trim();
		if (!emesPrompt) {
			this.malchusView.setStatus('Describe a scene before generating.', 'warning');
			return null;
		}
		if (this.previewInFlight) return null;
		this.previewInFlight = true;
		this.malchusView.setBusy(true);
		try {
			const sodResult = await this.keterApi.execute({ command: 'project.previewPrompt', payload: { prompt: emesPrompt } });
			if (!sodResult.ok) {
				this.malchusView.setStatus(sodResult.error.message, 'error');
				return sodResult;
			}
			this.malchusView.setPreviewActions(true);
			const keterTitle = sodResult.data?.summary?.title ?? 'Preview ready';
			this.malchusView.setStatus(`${keterTitle} — inspect it, then Apply when ready.`, 'success');
			return sodResult;
		} finally {
			this.previewInFlight = false;
			this.malchusView.setBusy(false);
		}
	}

	/** Applies the current generated preview through the existing undo-safe Studio workflow. */
	async apply() {
		const sodResult = await this.keterApi.execute({ command: 'project.applyPreview', payload: {} });
		if (!sodResult.ok) return this.fail(sodResult);
		this.malchusView.setPreviewActions(false);
		this.malchusView.setStatus('Preview applied to the timeline.', 'success');
		return sodResult;
	}

	/** Discards generated preview state while leaving the active project document untouched. */
	async discard() {
		const sodResult = await this.keterApi.execute({ command: 'project.discardPreview', payload: {} });
		if (!sodResult.ok) return this.fail(sodResult);
		this.malchusView.setPreviewActions(false);
		this.malchusView.setStatus('Preview discarded. Active project unchanged.', 'neutral');
		return sodResult;
	}

	/** Renders a structured API failure and returns it unchanged for optional caller inspection. */
	fail(sodResult) {
		this.malchusView.setStatus(sodResult?.error?.message ?? 'Animator command failed.', 'error');
		return sodResult;
	}
}
