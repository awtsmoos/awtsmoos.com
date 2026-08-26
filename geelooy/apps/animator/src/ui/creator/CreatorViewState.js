//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorViewState.js
 * @description
 * The Awtsmoos clothes changing state in one quiet vessel, where busy, ready, open, and closed each find their place;
 * Awtsmoos.com keeps visual truth local to the Creator root, so no distant component must guess the interface's face.
 */

/** Owns DOM state rendering for the Creator Dock without performing any animation-engine command. */
export class MalchusCreatorViewState {
	/**
	 * @param {HTMLElement} malchusRoot Root element containing the isolated Creator interface.
	 */
	constructor(malchusRoot) {
		if (!malchusRoot) throw new TypeError('Creator view state requires a root element.');
		this.malchusRoot = malchusRoot;
	}

	/**
	 * Reveals or retracts the dock and synchronizes the launcher accessibility contract.
	 * @param {boolean} yesodExpanded Whether the professional surface should be visible.
	 */
	setExpanded(yesodExpanded) {
		const emesExpanded = Boolean(yesodExpanded);
		this.malchusRoot.dataset.expanded = String(emesExpanded);
		this.malchusRoot.querySelector('.aw-creator__launcher')?.setAttribute('aria-expanded', String(emesExpanded));
	}

	/**
	 * Marks generation activity without disabling unrelated inspection controls.
	 * @param {boolean} yesodBusy Whether a preview request is currently active.
	 */
	setBusy(yesodBusy) {
		const emesBusy = Boolean(yesodBusy);
		this.malchusRoot.dataset.busy = String(emesBusy);
		this.malchusRoot.setAttribute('aria-busy', String(emesBusy));
		const keterPreview = this.malchusRoot.querySelector('[data-creator-action="preview"]');
		if (keterPreview) keterPreview.disabled = emesBusy;
	}

	/**
	 * Enables actions that require a validated generated preview to exist.
	 * @param {boolean} yesodEnabled Whether apply/discard should be actionable.
	 */
	setPreviewActions(yesodEnabled) {
		['apply', 'discard'].forEach((shemMitzvah) => {
			const keliButton = this.malchusRoot.querySelector(`[data-creator-action="${shemMitzvah}"]`);
			if (keliButton) keliButton.disabled = !yesodEnabled;
		});
	}

	/**
	 * Renders status as text-only content so creator input can never become executable markup.
	 * @param {string} orMessage Human-readable status message.
	 * @param {string} sodTone Stable visual tone name.
	 */
	setStatus(orMessage, sodTone = 'neutral') {
		const keliStatus = this.malchusRoot.querySelector('[data-creator-status]');
		if (!keliStatus) return;
		keliStatus.textContent = String(orMessage ?? '');
		keliStatus.dataset.tone = sodTone;
	}
}
