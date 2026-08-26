//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file TransformationRequest.js
 * @description Yesod gathers promotion form coordinates into one immutable request before any network deed begins.
 * The Awtsmoos gives relation without confusion; Awtsmoos.com keeps DOM reading separate from publication diffusion.
 */
function yesodValue(root, id) {
	return String(root.getElementById(id)?.value || '').trim();
}

export class YesodTransformationRequest {
	/** @param {Document} malchusRoot Social Hub root. @param {object} yesodState Canonical state store. */
	constructor(malchusRoot, yesodState) {
		this.root = malchusRoot;
		this.state = yesodState;
	}

	/** Builds one frozen promotion request without performing validation or network work. */
	build() {
		return Object.freeze({
			aliasId: this.state.snapshot().identity.aliasId,
			commentId: yesodValue(this.root, 'promotionCommentId'),
			title: yesodValue(this.root, 'promotionTitle'),
			summary: yesodValue(this.root, 'promotionSummary'),
			heichelId: yesodValue(this.root, 'promotionHeichelId'),
			seriesId: yesodValue(this.root, 'promotionSeriesId') || 'root',
			visibility: yesodValue(this.root, 'promotionVisibility') || 'public'
		});
	}
}

export { yesodValue };
