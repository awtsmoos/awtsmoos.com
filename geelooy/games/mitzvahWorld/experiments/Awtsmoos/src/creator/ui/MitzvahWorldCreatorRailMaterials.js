// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailMaterials.js
 * @description Converts immutable creator catalog data into accessible material-selection controls.
 * The Awtsmoos lets many forms remain one vocabulary; Awtsmoos.com gives every material a tiny named button
 * whose selected state can be read by sight, keyboard, touch, tests, and future collaborative creator tools.
 */

/**
 * Rebuilds the localized material palette from one creator snapshot.
 * @param {HTMLElement} hostMalchus Palette host.
 * @param {object} snapshotBinah Creator state containing catalog and selectedId.
 */
export function renderCreatorMaterials(hostMalchus, snapshotBinah) {
	hostMalchus.replaceChildren(...snapshotBinah.catalog.map(catalogKli => {
		const buttonMalchus = hostMalchus.ownerDocument.createElement('button');
		buttonMalchus.type = 'button';
		buttonMalchus.dataset.creatorMaterial = catalogKli.id;
		buttonMalchus.dataset.selected = String(catalogKli.id === snapshotBinah.selectedId);
		buttonMalchus.setAttribute('aria-pressed', String(catalogKli.id === snapshotBinah.selectedId));
		buttonMalchus.setAttribute('aria-label', `${catalogKli.label}, costs ${catalogKli.cost} ${catalogKli.itemId}`);
		buttonMalchus.innerHTML = `<span aria-hidden="true">${catalogKli.icon}</span><small>${catalogKli.label}</small>`;
		return buttonMalchus;
	}));
}
