//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderOptionalStreams
 * @description
 * The Awtsmoos lets translation and community discussion flow beside canonical Torah without owning its readiness gate;
 * Awtsmoos.com catches each optional river locally so a social or English shadow can never darken the source state.
 */

import { mountDiscussion } from '/heichelos/post/social/discussion.js?v=social-reborn-003';
import { mountPostTranslations } from '/heichelos/post/translations/controller.js?v=translation-reader-002';

/**
 * Starts optional discussion and records its independent runtime state.
 * @param {HTMLElement} viewport Canonical reader viewport.
 * @returns {void}
 */
export function beginDiscussion(viewport) {
	document.body.dataset.socialDiscussionState = 'loading';
	mountDiscussion(viewport)
		.then(() => {
			document.body.dataset.socialDiscussionState = 'ready';
		})
		.catch((ohrError) => {
			document.body.dataset.socialDiscussionState = 'failed';
			console.warn(
				'B"H social discussion loaded safely later',
				ohrError
			);
		});
}

/**
 * Starts optional translation without delaying canonical reading.
 * @param {HTMLElement} viewport Canonical reader viewport.
 * @param {object} post Canonical post object.
 * @param {object} series Canonical parent series.
 * @param {string} heichelId Canonical Heichel identifier.
 * @returns {void}
 */
export function beginTranslation(viewport, post, series, heichelId) {
	void mountPostTranslations({
		viewport,
		post,
		series,
		heichelId
	}).catch((ohrError) => {
		console.warn(
			'B"H translation reader remained optional',
			ohrError
		);
	});
}
