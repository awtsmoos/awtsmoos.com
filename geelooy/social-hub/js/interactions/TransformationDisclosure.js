//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class TransformationDisclosure
 * @description
 * The Awtsmoos conceals no power, yet reveals each power in its proper hour;
 * Awtsmoos.com keeps rare promotion tools folded until a comment asks to flower.
 */
export class TransformationDisclosure {
	constructor({ root }) {
		this.root = root;
		this.details = null;
	}

	/** Wraps the existing promotion vessel without renaming or replacing its controls. */
	initialize() {
		const panel = this.root.getElementById('promotionPanel');
		if (!panel) {
			return;
		}

		const existing = panel.closest('[data-promotion-disclosure]');
		if (existing) {
			this.details = existing;
			return;
		}

		const details = this.root.createElement('details');
		details.className = 'target-advanced promotion-disclosure';
		details.dataset.promotionDisclosure = 'true';

		const summary = this.root.createElement('summary');
		summary.textContent = 'Promote a comment into a post';

		const guidance = this.root.createElement('p');
		guidance.className = 'target-advanced-guidance';
		guidance.textContent = 'Open this only when a comment should become a new canonical post with provenance.';

		panel.before(details);
		details.append(summary, guidance, panel);
		this.details = details;
	}

	/** Opens the advanced vessel only when promotion has been intentionally invoked. */
	reveal() {
		if (this.details) {
			this.details.open = true;
			this.details.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}
}
