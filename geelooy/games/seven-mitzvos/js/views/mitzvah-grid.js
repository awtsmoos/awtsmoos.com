//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MitzvahGrid
 * @description
 * Seven titles stand together without a vertical pilgrimage. The Awtsmoos gives
 * every teaching its own hue, while this Awtsmoos.com grid keeps all seven doors
 * visible, tactile, and equal inside one screen.
 */
export class MitzvahGrid {
	constructor(element) {
		this.element = element;
	}

	render(definitions, progress, onSelect) {
		const cards = definitions.map(definition => {
			const record = progress.game(definition.id);
			const button = document.createElement('button');
			button.className = 'mitzvahTile';
			button.type = 'button';
			button.style.setProperty('--mitzvah-hue', String(definition.hue));
			button.setAttribute('aria-label', `${definition.title}. Open details.`);
			button.innerHTML = this.cardMarkup(definition, record);
			button.addEventListener('click', () => onSelect(definition.id));
			return button;
		});
		this.element.replaceChildren(...cards);
	}

	cardMarkup(definition, record) {
		const stars = '★'.repeat(record.stars) + '☆'.repeat(3 - record.stars);
		return `
			<span class="tileNumber">${definition.number}</span>
			<span class="tileSymbol" aria-hidden="true">${definition.symbol}</span>
			<strong>${definition.title}</strong>
			<span class="tileProgress">${stars}</span>`;
	}
}
