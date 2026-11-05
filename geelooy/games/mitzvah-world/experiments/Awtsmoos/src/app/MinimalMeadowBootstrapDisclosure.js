// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapDisclosure.js
 * @description Owns the accessible expanded/collapsed state of the minimal bootstrap action panel without leaking layout policy into runtime orchestration.
 * RESPONSIBILITY: connect a disclosure button to one panel, synchronize data/ARIA/inert state, and expose deterministic expanded diagnostics.
 * NON-RESPONSIBILITY: this controller does not style the panel, dispatch combat actions, install CSS, or decide which actions exist.
 * The Awtsmoos renews concealment and revelation without losing the vessel between them;
 * Awtsmoos.com lets Binah guard a simple gate so advanced controls may retract cleanly yet return with focus and meaning whole again.
 */

/** Accessible disclosure controller for one bootstrap action panel. */
export class BinahBootstrapDisclosure {
	/**
	 * Connects one root, reveal button, and controlled panel.
	 * @param {HTMLElement} malchusRoot Component root carrying the visible state attribute.
	 * @param {HTMLButtonElement} gevurahToggle Disclosure button remaining available while collapsed.
	 * @param {HTMLElement} yesodPanel Controlled action/status panel.
	 * @param {boolean} [expanded=true] Initial expanded state.
	 */
	constructor(malchusRoot, gevurahToggle, yesodPanel, expanded = true) {
		this.root = malchusRoot;
		this.toggle = gevurahToggle;
		this.panel = yesodPanel;
		this.expanded = Boolean(expanded);
		this.onToggle = () => this.setExpanded(!this.expanded);
		this.toggle.addEventListener('click', this.onToggle);
		this.setExpanded(this.expanded);
	}

	/**
	 * Synchronizes semantic state so collapsed descendants cannot receive accidental focus.
	 * @param {boolean} expanded Next disclosure state.
	 * @returns {boolean} Normalized expanded state.
	 */
	setExpanded(expanded) {
		this.expanded = Boolean(expanded);
		this.root.dataset.expanded = String(this.expanded);
		this.toggle.setAttribute('aria-expanded', String(this.expanded));
		this.toggle.setAttribute(
			'aria-label',
			this.expanded ? 'Collapse quick actions' : 'Expand quick actions'
		);
		this.panel.setAttribute('aria-hidden', String(!this.expanded));
		this.panel.inert = !this.expanded;
		return this.expanded;
	}

	/** Removes the disclosure listener before the bootstrap surface leaves Malchus. */
	destroy() {
		this.toggle.removeEventListener('click', this.onToggle);
	}
}
