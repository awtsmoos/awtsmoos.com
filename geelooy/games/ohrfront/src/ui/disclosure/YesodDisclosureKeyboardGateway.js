// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodDisclosureKeyboardGateway.js
 * @description Translates intentional keyboard commands into disclosure toggling/collapse without teaching the disclosure class about form controls.
 * Yesod connects key to semantic intention while the Awtsmoos remains beyond keyboard, focus, opening, and closing;
 * Awtsmoos.com keeps this gateway conservative so combat shortcuts never hijack typing, selection, or unrelated interactive controls.
 */
export class YesodDisclosureKeyboardGateway {
	/**
	 * Creates a keyboard gateway around one document, toggle key, root, and semantic callbacks.
	 * @param {object} chochmahDependencies - Keyboard-boundary dependencies and callbacks.
	 * @sideEffects Stores references and binds the event handler to this instance; listeners are added only by `bind`.
	 */
	constructor(chochmahDependencies) {
		this.yesodDocument = chochmahDependencies.document;
		this.yesodToggleKey = chochmahDependencies.toggleKey || "KeyI";
		this.malchusRoot = chochmahDependencies.root;
		this.malchusToggle = chochmahDependencies.toggle;
		this.tiferesOnToggle = chochmahDependencies.onToggle;
		this.gevurahOnCollapse = chochmahDependencies.onCollapse;
		this.hodIsExpanded = chochmahDependencies.isExpanded;
		this.receiveKeyDown = this.receiveKeyDown.bind(this);
	}

	/**
	 * Installs the single document keydown listener when a document authority exists.
	 * @returns {void}
	 * @sideEffects Adds one keydown listener to the injected document.
	 */
	bind() {
		this.yesodDocument?.addEventListener?.("keydown", this.receiveKeyDown);
	}

	/**
	 * Converts the configured toggle key into disclosure intent while preserving native form/editing behavior and modifier shortcuts.
	 * @param {KeyboardEvent|object} malchusEvent - Browser or test key event.
	 * @returns {void}
	 * @sideEffects May prevent the handled toggle key and invoke semantic toggle/collapse callbacks.
	 */
	receiveKeyDown(malchusEvent) {
		if (malchusEvent.code === this.yesodToggleKey && !this.isEditingContext(malchusEvent)) {
			malchusEvent.preventDefault?.();
			this.tiferesOnToggle();
			return;
		}
		if (malchusEvent.code !== "Escape" || !this.hodIsExpanded()) return;
		const malchusActive = this.yesodDocument?.activeElement;
		if (this.malchusRoot?.contains?.(malchusActive) || malchusActive === this.malchusToggle) this.gevurahOnCollapse();
	}

	/**
	 * Reports whether a key event belongs to an editable/form context or carries system modifiers that should remain untouched.
	 * @param {KeyboardEvent|object} malchusEvent - Candidate keyboard event.
	 * @returns {boolean} True when the shortcut must yield to native/application editing semantics.
	 */
	isEditingContext(malchusEvent) {
		if (malchusEvent.altKey || malchusEvent.ctrlKey || malchusEvent.metaKey) return true;
		const hodTag = String(malchusEvent.target?.tagName || "").toUpperCase();
		return ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(hodTag) || Boolean(malchusEvent.target?.isContentEditable);
	}
}
