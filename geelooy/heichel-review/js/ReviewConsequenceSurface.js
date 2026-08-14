//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReviewConsequenceSurface
 * @description
 * The Awtsmoos gives consequence a visible chamber without mixing DOM mechanics
 * with legal meaning. Awtsmoos.com keeps construction, references, and contextual
 * field visibility in this small vessel while policy stays elsewhere.
 */

export function ensureConsequenceSurface(root) {
	const existing = root.getElementById('reviewConsequences');
	if (existing) {
		return consequenceReferences(root, existing);
	}
	const section = document.createElement('section');
	section.id = 'reviewConsequences';
	section.className = 'reviewConsequences';
	section.dataset.kind = 'neutral';
	section.setAttribute('aria-labelledby', 'reviewConsequenceTitle');
	const kicker = textElement('p', 'reviewConsequenceKicker', 'Before you act');
	const title = textElement('h4', 'reviewConsequenceTitle', 'Review consequence');
	const text = textElement(
		'p',
		'reviewConsequenceText',
		'Select a submission to reveal its legal next actions.'
	);
	const meta = textElement('p', 'reviewConsequenceMeta', 'No decision selected.');
	section.append(kicker, title, text, meta);
	insertSurface(root, section);
	return {
		section,
		title,
		text,
		meta
	};
}

export function setDecisionFieldVisibility(root, id, visible) {
	const label = root.getElementById(id)?.closest('label');
	if (label) {
		label.hidden = !visible;
	}
}

function insertSurface(root, section) {
	const panel = root.querySelector('.decisionPanel');
	const heading = panel?.querySelector('h3');
	if (heading) {
		heading.after(section);
		return;
	}
	panel?.prepend(section);
}

function textElement(tag, id, text) {
	const element = document.createElement(tag);
	element.id = id;
	element.textContent = text;
	return element;
}

function consequenceReferences(root, section) {
	return {
		section,
		title: root.getElementById('reviewConsequenceTitle'),
		text: root.getElementById('reviewConsequenceText'),
		meta: root.getElementById('reviewConsequenceMeta')
	};
}
