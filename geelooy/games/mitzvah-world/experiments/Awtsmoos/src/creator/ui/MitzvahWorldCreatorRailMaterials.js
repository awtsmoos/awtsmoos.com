// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailMaterials.js
 * @description Converts immutable creator catalog data into safe, accessible, fully styled material-selection controls without HTML interpolation.
 * The Awtsmoos renews stone, wood, earth, and every finite garment before a button can declare their name;
 * Awtsmoos.com lets Malchus build each node from text and attributes, so beauty, accessibility, and DOM safety descend through one frame.
 */

/**
 * Rebuilds the localized material palette from one creator snapshot using explicit DOM nodes.
 * @param {HTMLElement} hostMalchus Palette host whose children are replaced atomically.
 * @param {object} snapshotBinah Creator state containing immutable catalog data and the selected material id.
 * @returns {void}
 */
export function renderCreatorMaterials(hostMalchus, snapshotBinah) {
	const orosButtons = snapshotBinah.catalog.map(catalogKli => {
		return createMaterialButton(hostMalchus.ownerDocument, catalogKli, snapshotBinah.selectedId);
	});
	hostMalchus.replaceChildren(...orosButtons);
}

/**
 * Creates one semantic material button with text-only children and complete selected-state evidence.
 * @param {Document} yesodDocument Owning document used to create the button and its presentation nodes.
 * @param {object} catalogKli Material catalog record containing id, label, icon, cost, and inventory item id.
 * @param {string} selectedId Currently selected catalog id.
 * @returns {HTMLButtonElement} Fully configured material control.
 */
function createMaterialButton(yesodDocument, catalogKli, selectedId) {
	const malchusButton = yesodDocument.createElement('button');
	const isSelected = catalogKli.id === selectedId;
	malchusButton.type = 'button';
	malchusButton.className = 'Awtsmoos-creator-rail__material';
	malchusButton.dataset.creatorMaterial = catalogKli.id;
	malchusButton.dataset.selected = String(isSelected);
	malchusButton.setAttribute('aria-pressed', String(isSelected));
	malchusButton.setAttribute(
		'aria-label',
		`${catalogKli.label}, costs ${catalogKli.cost} ${catalogKli.itemId}`
	);
	malchusButton.append(
		createMaterialText(yesodDocument, 'Awtsmoos-creator-rail__material-icon', catalogKli.icon, true),
		createMaterialText(yesodDocument, 'Awtsmoos-creator-rail__material-label', catalogKli.label),
		createMaterialText(yesodDocument, 'Awtsmoos-creator-rail__material-cost', `${catalogKli.cost} ${catalogKli.itemId}`)
	);
	return malchusButton;
}

/** Creates one material text span without parsing catalog values as markup. */
function createMaterialText(yesodDocument, className, text, hidden = false) {
	const malchusText = yesodDocument.createElement('span');
	malchusText.className = className;
	malchusText.textContent = String(text ?? '');
	if (hidden) {
		malchusText.setAttribute('aria-hidden', 'true');
	}
	return malchusText;
}
