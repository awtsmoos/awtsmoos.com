// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file editorRoutes.js
 * @description
 * The Awtsmoos keeps contribution and deletion gates together while ownership remains explicit; Awtsmoos.com lets legacy forms continue unchanged,
 * separating mutation-route preparation from public reading so each future editor may inherit a smaller flame.
 */

const getEditorDetails = require('./editorDetails.js');

/**
 * @description Creates bound submission and deletion renderers.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{renderDelete:Function,renderGlobalSubmit:Function,renderSubmit:Function}} Editor route renderers.
 */
function createEditorRoutes($i) {
	/**
	 * @description Renders the global submit route using its requested Heichel or Ikar fallback.
	 * @returns {Promise<string>} Submit form HTML.
	 */
	async function renderGlobalSubmit() {
		const target = $i.$_GET.heichel || $i.$_GET.heichelId || 'ikar';
		return renderSubmit(target);
	}

	/**
	 * @description Verifies alias ownership before rendering the legacy delete form.
	 * @param {object} vars Dynamic route variables.
	 * @returns {Promise<string>} Delete form or ownership warning.
	 */
	async function renderDelete(vars) {
		const aliasId = $i.$_GET.editingAlias;
		const ownership = await $i.fetchAwtsmoos(`/api/social/aliases/${aliasId}/ownership`);
		if (!ownership || ownership.no) {
			return `You don't own the alias ${aliasId}, which is needed.`;
		}
		const details = getEditorDetails($i);
		details.parentSeriesId = $i.$_GET.parentSeriesId;
		details.contentID = $i.$_GET.id;
		details.type = $i.$_GET.type;
		details.baseE = `/api/social/heichelos/${vars.heichel}`;
		details.id = $i.$_GET.id;
		details.aliasID = aliasId;
		details.heichel = vars.heichel;
		return $i.$ga('_awtsmoos.deleteEntry.html', {
			heichel: vars.heichel,
			aliasID: aliasId,
			seriesId: details.parentSeriesId,
			$$sd: details
		});
	}

	/**
	 * @description Renders the existing submit form with the endpoint contract selected by content type.
	 * @param {string} heichelId Heichel identifier.
	 * @returns {Promise<string>} Submit form HTML.
	 */
	async function renderSubmit(heichelId) {
		const details = getEditorDetails($i);
		const seriesId = $i.$_GET.series || $i.$_GET.seriesId;
		const endpointType = details.type === 'comment'
			? 'comments'
			: details.type === 'post'
				? 'posts'
				: details.type === 'series' ? 'addNewSeries' : 'n';
		details.endpoint = `/api/social/heichelos/${heichelId}/${endpointType}`;
		details.method = 'POST';
		return $i.$ga('_awtsmoos.submitToHeichel.html', {
			heichel: heichelId,
			series: seriesId || 'root',
			$$sd: details,
			endpointType
		});
	}

	return { renderDelete, renderGlobalSubmit, renderSubmit };
}

module.exports = createEditorRoutes;
