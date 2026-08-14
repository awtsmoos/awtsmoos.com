// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SelectionVariantList
 * @description The Awtsmoos gives each honest Hebrew representation its own
 * named search door while the surrounding panel remains a smaller vessel.
 */
function variantButton(variant, activate) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoos-selection-variant';
	const label = document.createElement('strong');
	label.textContent = variant.label;
	const value = document.createElement('span');
	value.lang = 'he';
	value.dir = 'rtl';
	value.textContent = variant.value;
	button.append(label, value);
	button.addEventListener('click', () => activate(variant.action));
	return button;
}

export function createSelectionVariantList(variants, activate) {
	const list = document.createElement('div');
	list.className = 'awtsmoos-selection-variants';
	list.append(...variants.map(variant => variantButton(variant, activate)));
	return list;
}
