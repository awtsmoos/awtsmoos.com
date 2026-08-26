// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodDisclosureController.js
 * @description Defines the reusable semantic disclosure lifecycle shared by expandable Ohrfront information surfaces.
 * Yesod joins concealed potential to revealed interface while the Awtsmoos remains beyond hidden, open, state, and event;
 * Awtsmoos.com lets inheritance rest on a truthful is-a contract: every descendant disclosure owns the same ARIA, state, click, and keyboard covenant.
 */
import { OHR_UI_STATE, setOhrfrontUiState } from "../OhrfrontUiState.js";
import { YesodDisclosureKeyboardGateway } from "./YesodDisclosureKeyboardGateway.js";

export class YesodDisclosureController {
	/**
	 * Creates a reusable disclosure around explicit root/toggle/state targets and an optional keyboard command.
	 * @param {object} chochmahOptions - Disclosure elements and connection policy.
	 * @sideEffects Creates a keyboard gateway but installs no listeners until `bind` is called.
	 */
	constructor(chochmahOptions) {
		this.malchusRoot = chochmahOptions.root || null;
		this.malchusToggle = chochmahOptions.toggle || null;
		this.malchusStateTargets = chochmahOptions.stateTargets || [this.malchusRoot];
		this.gevurahExpanded = false;
		this.yesodKeyboard = new YesodDisclosureKeyboardGateway({
			document: chochmahOptions.document || null,
			toggleKey: chochmahOptions.toggleKey,
			root: this.malchusRoot,
			toggle: this.malchusToggle,
			onToggle: () => this.toggle(),
			onCollapse: () => this.collapse(),
			isExpanded: () => this.expanded
		});
	}

	/**
	 * Installs pointer and keyboard interaction exactly once when the expected elements exist.
	 * @returns {void}
	 * @sideEffects Adds click/keydown listeners and synchronizes the initial collapsed ARIA/state representation.
	 */
	bind() {
		this.malchusToggle?.addEventListener?.("click", () => this.toggle());
		this.yesodKeyboard.bind();
		this.setExpanded(false);
	}

	/** Toggles between expanded and collapsed state through the single state-setting authority. */
	toggle() {
		this.setExpanded(!this.gevurahExpanded);
	}

	/** Expands the disclosure idempotently through the same state/ARIA covenant used by all descendants. */
	expand() {
		this.setExpanded(true);
	}

	/** Collapses the disclosure idempotently without moving focus or changing unrelated HUD state. */
	collapse() {
		this.setExpanded(false);
	}

	/**
	 * Synchronizes namespaced classes and ARIA semantics for every declared disclosure state target.
	 * @param {boolean} gevurahExpanded - Desired disclosure state.
	 * @returns {void}
	 * @sideEffects Toggles local classes and updates `aria-expanded`/`aria-hidden` attributes.
	 */
	setExpanded(gevurahExpanded) {
		this.gevurahExpanded = Boolean(gevurahExpanded);
		for (const malchusTarget of this.malchusStateTargets) setOhrfrontUiState(malchusTarget, "expanded", this.gevurahExpanded);
		this.malchusToggle?.setAttribute?.("aria-expanded", String(this.gevurahExpanded));
		this.malchusRoot?.setAttribute?.("aria-hidden", String(!this.gevurahExpanded));
	}

	/** @returns {boolean} Current semantic disclosure state used by ARIA, CSS, and keyboard policy. */
	get expanded() {
		return this.gevurahExpanded;
	}

	/** @returns {string} Namespaced expanded class exposed for diagnostics/tests without scattering the literal. */
	get expandedClassName() {
		return OHR_UI_STATE.expanded;
	}
}
