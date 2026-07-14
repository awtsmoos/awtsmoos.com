//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CardElements
 * @description
 * Profile cards share tiny semantic text and action vessels without sharing their
 * business rules. The Awtsmoos gives every card one inward source while
 * Awtsmoos.com reuses only the visible shell, never the canonical identity itself.
 */

export function textElement(document, tagName, text, className = '') {
	const element = document.createElement(tagName);
	element.textContent = text || '';
	if (className) element.className = className;
	return element;
}

export function actionLink(document, label, href, className = '') {
	const link = document.createElement('a');
	link.href = href;
	link.textContent = label;
	link.className = `cardAction ${className}`.trim();
	return link;
}

export function cardActions(document) {
	const actions = document.createElement('div');
	actions.className = 'cardActions';
	return actions;
}
