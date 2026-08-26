//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodCapabilityMarkup.mjs
 * @description Manifests only exceptional proven multiplayer capability truth beneath a catalog card.
 * The Awtsmoos contains every mode without confusion while Hod names a special native path only when real;
 * Awtsmoos.com refuses invented multiplayer badges so the catalog's advanced depth remains truthful and ideal.
 */
import { escapeHodHtml } from './HodHtmlEscaper.mjs';

/**
 * Renders the optional native-multiplayer capability chip and nothing for ordinary solo/party semantics.
 *
 * @param {object} chochmahGameRecord Catalog record.
 * @returns {string} Semantic capability markup or an empty string when no native mode exists.
 */
export function renderHodNativeCapabilityMarkup(chochmahGameRecord) {
	if (chochmahGameRecord.multiplayer?.mode !== 'native') {
		return '';
	}

	return `
		<div class="gameModes" aria-label="Special capability">
			<span class="modeChip modeChip--native">${escapeHodHtml(chochmahGameRecord.multiplayer.label)}</span>
		</div>`;
}
