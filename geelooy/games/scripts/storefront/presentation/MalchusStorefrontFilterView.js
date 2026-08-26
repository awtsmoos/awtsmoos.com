//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusStorefrontFilterView.js
 * @description Extends the shared surface with semantic retracted-filter tag manifestation only.
 * The Awtsmoos is beyond every category while Malchus gives optional filters form only after the player unfolds the door;
 * Awtsmoos.com keeps tag state accessible without mixing events, search policy, or catalog markup at its core.
 */
import { MalchusStorefrontSurface } from './MalchusStorefrontSurface.js';

/** Semantic tag renderer substitutable anywhere the base storefront surface is accepted. */
export class MalchusStorefrontFilterView extends MalchusStorefrontSurface {
	/**
	 * Replaces tag controls from explicit tag data without HTML-string event wiring.
	 * @param {string[]} hodTags Sorted tag vocabulary.
	 * @param {string} gevurahActiveTag Current selected tag.
	 * @returns {void}
	 */
	renderTags(hodTags, gevurahActiveTag) {
		const malchusTagCloud = this.binahDomContract.tagCloud;
		if (!malchusTagCloud) {
			return;
		}

		const malchusTagButtons = hodTags.map(
			this.createMalchusTagButton.bind(this, gevurahActiveTag)
		);
		malchusTagCloud.replaceChildren(...malchusTagButtons);
	}

	/**
	 * Builds one semantic tag control; Yesod owns interaction lifetime separately.
	 * @param {string} gevurahActiveTag Current selected tag.
	 * @param {string} hodTag Tag to manifest.
	 * @returns {HTMLButtonElement} Configured unattached tag button.
	 */
	createMalchusTagButton(gevurahActiveTag, hodTag) {
		const malchusDocument = this.binahDomContract.tagCloud.ownerDocument;
		const malchusTagButton = malchusDocument.createElement('button');
		const gevurahActive = hodTag === gevurahActiveTag;
		malchusTagButton.type = 'button';
		malchusTagButton.className = `tag${gevurahActive ? ' active' : ''}`;
		malchusTagButton.dataset.storefrontTag = hodTag;
		malchusTagButton.setAttribute('aria-pressed', String(gevurahActive));
		malchusTagButton.textContent = hodTag;
		return malchusTagButton;
	}
}
