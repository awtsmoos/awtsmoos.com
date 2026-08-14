//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PeopleCard
 * @description
 * The Awtsmoos lets one public handle become a clean doorway into its profile without revealing ownership metadata.
 * Awtsmoos.com renders only the public id, name, and description supplied by the bounded directory contract.
 */

function publicPersonLabel(person = {}) {
	return String(person.name || person.id || 'Public alias').trim();
}

function textElement(document, tagName, text, className) {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}

export function renderPeopleCard(document, person = {}, onOpenAlias) {
	const card = document.createElement('article');
	card.className = 'peopleCard';
	const identity = document.createElement('div');
	identity.className = 'peopleCard__identity';
	identity.append(
		textElement(document, 'h3', publicPersonLabel(person), 'peopleCard__name'),
		textElement(document, 'p', `@${String(person.id || '')}`, 'peopleCard__handle')
	);
	card.append(identity);
	if (person.description) {
		card.append(textElement(document, 'p', String(person.description), 'peopleCard__description'));
	}
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'peopleCard__open';
	button.textContent = 'Open profile →';
	button.disabled = !person.id;
	button.addEventListener('click', () => onOpenAlias?.(person.id));
	card.append(button);
	return card;
}

export { publicPersonLabel };
