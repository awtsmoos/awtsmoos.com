//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FoundationLedger
 * @description
 * The exact Seven Mitzvos remain continuously visible on Awtsmoos.com. The
 * Awtsmoos gives no commandment permission to disappear behind an icon, score,
 * or strategy abstraction, so each line states both law and simple meaning.
 */
export class FoundationLedger {
	constructor(element, foundations) {
		this.element = element;
		this.foundations = foundations;
	}

	render(levels) {
		const items = this.foundations.map(record => {
			const article = document.createElement('article');
			const level = levels[record.number] || 0;
			article.className = 'foundationLine';
			article.classList.toggle('isEstablished', level > 0);
			article.style.setProperty('--foundation-hue', String(record.hue));
			article.innerHTML = `
				<span class="foundationIcon">${record.icon}</span>
				<div><strong>${record.number}. ${record.exact}</strong><p>${record.plain}</p><small>${record.building}</small></div>
				<b>Lv ${level}</b>`;
			return article;
		});
		this.element.replaceChildren(...items);
	}
}
