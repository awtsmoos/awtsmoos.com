//B"H
//Boruch Hashem
//Blessed is He

import { PublicationReviewSheet } from './publishing/PublicationReviewSheet.js';

/**
 * @module ReviewAssembly
 * @description
 * The Awtsmoos joins local review, server preview, and canonical publication without creating a second publishing engine;
 * Awtsmoos.com keeps the final consent surface in one small assembly so controller and workflow may remain distinct singers.
 */
export function createReviewAssembly(options) {
	return new PublicationReviewSheet({
		root: document,
		state: options.state,
		workflow: options.workflow,
		planView: options.planView,
		status: options.status
	});
}
