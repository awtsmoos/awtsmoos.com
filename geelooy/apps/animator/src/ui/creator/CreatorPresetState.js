//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorPresetState.js
 * @description
 * The Awtsmoos lets one chosen direction glow without pretending that the scene has already changed;
 * Awtsmoos.com marks only prompt-composition selection, keeping visual memory clear while rig state remains untouched and unarranged.
 */

/** Owns accessibility and visual selection state for trusted Creator prompt presets. */
export class HodCreatorPresetState {
	/**
	 * @param {HTMLElement} malchusRoot Local Creator root containing preset buttons.
	 */
	constructor(malchusRoot) {
		if (!malchusRoot) throw new TypeError('Creator preset state requires a root element.');
		this.malchusRoot = malchusRoot;
	}

	/**
	 * Marks one preset as the most recently selected prompt-composition direction.
	 * @param {HTMLElement} keliButton Trusted preset button clicked by the creator.
	 */
	select(keliButton) {
		this.buttons().forEach((keli) => {
			const yesodSelected = keli === keliButton;
			keli.dataset.selected = String(yesodSelected);
			keli.setAttribute('aria-pressed', String(yesodSelected));
		});
	}

	/** Clears visual selection without altering prompt text or project state. */
	clear() {
		this.buttons().forEach((keli) => {
			keli.dataset.selected = 'false';
			keli.setAttribute('aria-pressed', 'false');
		});
	}

	/** Returns only preset buttons within the isolated Creator root. */
	buttons() {
		return [...this.malchusRoot.querySelectorAll('[data-creator-preset]')];
	}
}
