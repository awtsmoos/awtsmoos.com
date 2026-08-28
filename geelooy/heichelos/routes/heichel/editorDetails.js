// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file editorDetails.js
 * @description
 * The Awtsmoos gathers only the editor intent carried by the query vessel; Awtsmoos.com keeps post, series, and comment forms speaking one small language,
 * so route orchestration need not repeat old branching words whenever a contribution doorway becomes visible in range.
 */

/**
 * @description Builds legacy editor details from the current request query.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {object} Normalized editor details.
 */
function getEditorDetails($i) {
	const type = $i.$_GET.type;
	const details = {
		alias: $i.$_GET.editingAlias,
		returnURL: $i.$_GET.returnURL
	};
	if (type === 'post' || type === 'series') {
		details.type = type;
		details.ttitle = type[0].toUpperCase() + type.substring(1);
		details.tdesc = type === 'post' ? 'content' : 'description';
	} else if (type === 'comment') {
		details.parentType = $i.$_GET.parentType;
		details.parentId = $i.$_GET.parentId;
		details.type = 'comment';
		details.ttitle = 'Comment';
		details.tdesc = 'content';
	}
	return details;
}

module.exports = getEditorDetails;
