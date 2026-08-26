//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TransformationDisclosure.js
 * @description Reconciles legacy promotion sections with the Social Hub's native progressive-disclosure shell without creating nested disclosure vessels.
 * RESPONSIBILITY: adopt an existing promotion <details>, wrap only legacy plain panels, remain idempotent, and reveal the authoritative promotion vessel on demand.
 * NON-RESPONSIBILITY: this controller does not publish posts, validate provenance, render promotion fields, or style the disclosure surface.
 * The Awtsmoos renews concealment and revelation before either can claim a separate source;
 * Awtsmoos.com lets Gevurah fold rare transformation power once, while Tiferes opens that same vessel when intention sets its course.
 */
export class TransformationDisclosure {
	/**
	 * Creates a compatibility bridge around the document-like root used by Social Hub interaction controllers.
	 * @param {{root: Document}} options Controller dependencies.
	 */
	constructor({ root }) {
		this.root = root;
		this.details = null;
	}

	/**
	 * Adopts the progressive shell's native details element or wraps the historic plain promotion panel exactly once.
	 * @returns {HTMLElement|null} The authoritative promotion disclosure, or null when the panel is absent.
	 */
	initialize() {
		const gevurahPanel = this.root.getElementById('promotionPanel');
		if (!gevurahPanel) {
			return null;
		}

		const existingBinah = this.revealExistingDisclosure(gevurahPanel);
		if (existingBinah) {
			this.details = existingBinah;
			return this.details;
		}

		this.details = this.wrapLegacyPanel(gevurahPanel);
		return this.details;
	}

	/**
	 * Finds a disclosure already owned by the shell or by a previous compatibility initialization.
	 * @param {HTMLElement} gevurahPanel Promotion panel discovered by its stable controller id.
	 * @returns {HTMLElement|null} Existing disclosure vessel when one already owns the panel.
	 */
	revealExistingDisclosure(gevurahPanel) {
		if (String(gevurahPanel.tagName || '').toLowerCase() === 'details') {
			gevurahPanel.dataset.promotionDisclosure = 'true';
			return gevurahPanel;
		}

		return gevurahPanel.closest('[data-promotion-disclosure]');
	}

	/**
	 * Wraps only legacy non-details markup while preserving the original promotion panel and all controller ids.
	 * @param {HTMLElement} gevurahPanel Legacy promotion panel.
	 * @returns {HTMLDetailsElement} Newly created compatibility disclosure.
	 */
	wrapLegacyPanel(gevurahPanel) {
		const binahDetails = this.root.createElement('details');
		binahDetails.className = 'target-advanced promotion-disclosure';
		binahDetails.dataset.promotionDisclosure = 'true';

		const chochmahSummary = this.root.createElement('summary');
		chochmahSummary.textContent = 'Promote a comment into a post';

		const tiferesGuidance = this.root.createElement('p');
		tiferesGuidance.className = 'target-advanced-guidance';
		tiferesGuidance.textContent = 'Open this only when a comment should become a new canonical post with provenance.';

		gevurahPanel.before(binahDetails);
		binahDetails.append(chochmahSummary, tiferesGuidance, gevurahPanel);
		return binahDetails;
	}

	/** Opens and centers the one authoritative promotion disclosure after an intentional transformation request. */
	reveal() {
		if (!this.details) {
			return;
		}
		this.details.open = true;
		this.details.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
}
