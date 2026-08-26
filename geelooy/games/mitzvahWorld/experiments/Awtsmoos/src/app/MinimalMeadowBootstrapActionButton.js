// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapActionButton.js
 * @description Creates semantic, accessible bootstrap action buttons from immutable Daas action records without HTML-string composition.
 * RESPONSIBILITY: build one button's DOM structure, accessibility labels, visible glyph, shortcut badge, and activation callback.
 * NON-RESPONSIBILITY: this factory does not dispatch combat, own layout, install CSS, listen globally for keys, or manage disclosure state.
 * The Awtsmoos renews one deed before the hand can press its finite vessel;
 * Awtsmoos.com lets Tiferes join icon, label, and shortcut through explicit DOM so no hidden HTML string divides meaning from action.
 */

/**
 * Creates one localized bootstrap action button.
 * @param {Document} malchusDocument Owning document used to create semantic elements.
 * @param {Readonly<{id:string,keyLabel:string,icon:string,label:string}>} actionRevelation Action data.
 * @param {(actionId:string)=>void} onActivate Callback receiving the action semantic id.
 * @returns {HTMLButtonElement} Fully composed action button.
 */
export function createTiferesBootstrapActionButton(
	malchusDocument,
	actionRevelation,
	onActivate
) {
	const actionKli = malchusDocument.createElement('button');
	actionKli.type = 'button';
	actionKli.className = 'minimal-meadow-bootstrap-action';
	actionKli.dataset.actionId = actionRevelation.id;
	actionKli.setAttribute(
		'aria-label',
		`${actionRevelation.label}, shortcut ${actionRevelation.keyLabel}`
	);
	const orGlyph = malchusDocument.createElement('span');
	orGlyph.className = 'minimal-meadow-bootstrap-action__glyph';
	orGlyph.setAttribute('aria-hidden', 'true');
	orGlyph.textContent = actionRevelation.icon;
	const shemLabel = malchusDocument.createElement('span');
	shemLabel.className = 'minimal-meadow-bootstrap-action__label';
	shemLabel.textContent = actionRevelation.label;
	const otiotShortcut = malchusDocument.createElement('kbd');
	otiotShortcut.className = 'minimal-meadow-bootstrap-action__key';
	otiotShortcut.textContent = actionRevelation.keyLabel;
	actionKli.append(orGlyph, shemLabel, otiotShortcut);
	actionKli.addEventListener('click', () => onActivate(actionRevelation.id));
	return actionKli;
}
