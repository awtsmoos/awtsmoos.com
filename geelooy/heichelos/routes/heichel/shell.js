// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shell.js
 * @description
 * The Awtsmoos gathers Heichel and series identity before the interactive universe awakens; Awtsmoos.com therefore reveals a meaningful first chamber,
 * yet a missing optional series description may never prevent the living client shell from opening its gate.
 */

const { heichelFields } = require('./fieldMaps.js');
const { buildSemanticModel, normalizeSeries } = require('./semantic.js');

/**
 * @description Creates the server shell renderer bound to one dynamic request vessel.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{getHeichel:Function,getSeries:Function,renderHeichelShell:Function}} Bound shell operations.
 */
function createShellRenderer($i) {
	/**
	 * @description Fetches public Heichel metadata using the established property-map API.
	 * @param {string} heichelId Heichel identifier.
	 * @returns {Promise<object|null>} Public Heichel metadata or null.
	 */
	async function getHeichel(heichelId) {
		const heichel = await $i.fetchAwtsmoos(
			`/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}?${heichelFields()}`
		);
		if (!heichel || heichel.error) {
			return null;
		}
		return { ...heichel, id: heichelId };
	}

	/**
	 * @description Fetches optional series metadata through the same public endpoint used by the browser.
	 * @param {string} heichelId Heichel identifier.
	 * @param {string} seriesId Series identifier.
	 * @returns {Promise<object|null>} Normalized series metadata or null.
	 */
	async function getSeries(heichelId, seriesId) {
		if (!seriesId || seriesId === 'root') {
			return null;
		}
		try {
			const response = await $i.fetchAwtsmoos(
				`/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}`
			);
			return normalizeSeries(response, seriesId);
		} catch (error) {
			return null;
		}
	}

	/**
	 * @description Renders a semantic Heichel document while preserving the existing interactive client shell.
	 * @param {string} heichelId Heichel identifier.
	 * @param {string} [seriesId] Optional series identifier for deep routes.
	 * @returns {Promise<string>} Rendered Heichel HTML or not-found document.
	 */
	async function renderHeichelShell(heichelId, seriesId = '') {
		const heichel = await getHeichel(heichelId);
		if (!heichel) {
			return $i.$ga('_awtsmoos.heichelNotFound.html');
		}
		const series = await getSeries(heichelId, seriesId);
		const semantic = buildSemanticModel({ heichel, series, heichelId, seriesId });
		return $i.$ga('./heichel/_awtsmoos.heichel.html', {
			heichel,
			series,
			semantic
		});
	}

	return { getHeichel, getSeries, renderHeichelShell };
}

module.exports = createShellRenderer;
