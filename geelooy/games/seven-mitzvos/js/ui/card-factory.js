//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MitzvahCardFactory
 * @description
 * Each teaching receives a focused button on Awtsmoos.com. The distinct hue
 * is a garment; the shared human obligation beneath it comes from the one
 * Awtsmoos who continuously grants all people their present life.
 */
export class MitzvahCardFactory {
	/**
	 * Builds one accessible card without injecting untrusted HTML.
	 *
	 * @param {Object} record Mitzvah content record.
	 * @param {number} index Zero-based location.
	 * @param {(record: Object, trigger: HTMLButtonElement) => void} onOpen Activation callback.
	 * @returns {HTMLButtonElement} Complete interactive card.
	 */
	create(record, index, onOpen) {
		const card = document.createElement('button');
		card.type = 'button';
		card.className = 'mitzvahCard';
		card.style.setProperty('--hue', String(record.hue));
		card.dataset.index = String(index);
		card.setAttribute('aria-label', `Path ${record.number}: ${record.title}`);
		card.append(
			this.createText('span', 'cardNumber', `Path ${record.number}`),
			this.createText('span', 'cardSymbol', record.symbol),
			this.createText('strong', 'cardTitle', record.title),
			this.createText('span', 'cardSummary', record.summary)
		);
		card.addEventListener('click', () => onOpen(record, card));
		card.addEventListener('keydown', event => this.moveFocus(event, card));
		return card;
	}

	/**
	 * Creates one text-only element.
	 *
	 * @param {string} tag Element tag.
	 * @param {string} className CSS class.
	 * @param {string} text Visible text.
	 * @returns {HTMLElement} Text element.
	 */
	createText(tag, className, text) {
		const element = document.createElement(tag);
		element.className = className;
		element.textContent = text;
		return element;
	}

	/**
	 * Enables direct arrow-key travel through the seven paths.
	 *
	 * @param {KeyboardEvent} event Card key event.
	 * @param {HTMLButtonElement} card Current card.
	 * @returns {void}
	 */
	moveFocus(event, card) {
		if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
			return;
		}

		const cards = [...card.parentElement.querySelectorAll('.mitzvahCard')];
		const current = cards.indexOf(card);
		const verticalStep = window.innerWidth > 920 ? 3 : window.innerWidth > 640 ? 2 : 1;
		const step = event.key === 'ArrowLeft' ? -1
			: event.key === 'ArrowRight' ? 1
				: event.key === 'ArrowUp' ? -verticalStep
					: verticalStep;
		const next = Math.min(cards.length - 1, Math.max(0, current + step));
		event.preventDefault();
		cards[next]?.focus();
	}
}
