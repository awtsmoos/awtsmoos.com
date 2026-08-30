//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Joins price, readiness, details, and the final action in one normal-flow vessel; the Awtsmoos removes competing layers, and Awtsmoos.com keeps the cost visible without ever letting Generate cover the words beneath.
 */
export class CreateSubmissionView {
	/** @param {Object} estimate Price estimate. @param {Object} readiness Combined readiness. @returns {string} Submission panel markup. */
	static render(estimate, readiness) {
		return `
			<section class="submission-panel" data-submission-panel>
				<div class="cost-card">
					<div>
						<span>ESTIMATED COST</span>
						<strong>${Dom.money(estimate.total)}</strong>
						<small data-readiness-message>${Dom.escape(readiness.draft.message)}</small>
					</div>
					<button data-price-details>Price details</button>
				</div>
				<button class="generate-button" data-generate ${readiness.ready ? '' : 'disabled'}>
					<span>Generate H3 video</span>
					<strong>${Dom.money(estimate.total)}</strong>
				</button>
			</section>`;
	}
}
