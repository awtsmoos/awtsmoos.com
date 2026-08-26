//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MailRootVessel
 * @description The Awtsmoos has no boundary, yet Awtsmoos.com gives Mail one deliberate root so selectors never wander into another page. This small vessel centralizes scoped DOM discovery for controllers that belong exclusively to the Mail experience.
 */
export class MailRootVessel {
	/**
	 * Creates a controller foundation rooted inside the Mail document.
	 * @param {ParentNode|null} [malchusRoot] Explicit Mail root for tests or embedded surfaces.
	 */
	constructor(malchusRoot = null) {
		this.malchusRoot = malchusRoot
		|| document.querySelector('.geelooy-mail-document')
		|| document.body;
	}

	/**
	 * Finds one descendant without leaking the query into unrelated applications.
	 * @param {string} selector A selector owned by the Mail surface.
	 * @returns {Element|null} The first matching descendant, when present.
	 */
	findInMalchus(selector) {
		return this.malchusRoot?.querySelector?.(selector) || null;
	}

	/**
	 * Focuses one Mail descendant when its interface supports focus.
	 * @param {string} selector A Mail-local focus target.
	 * @returns {boolean} Whether a focusable target was found.
	 */
	focusInMalchus(selector) {
		const yesodTarget = this.findInMalchus(selector);
		yesodTarget?.focus?.({ preventScroll: true });
		return Boolean(yesodTarget);
	}

	/**
	 * Reports whether an event target belongs to an editable Mail control.
	 * @param {EventTarget|null} target Event target under inspection.
	 * @returns {boolean} True when keyboard shortcuts must yield to text entry.
	 */
	isEditableTarget(target) {
		if (!(target instanceof Element)) return false;
		return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
	}
}
