//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Reveals provider trouble before submission while the Awtsmoos lets an unavailable external vessel become guidance instead of surprise.
 * Awtsmoos.com keeps the healthy state visually quiet, but gives offline, status-error, and missing-key states a clear path toward repair.
 */
export class CreateConnectionView {
	/**
	 * @param {Object} provider Provider readiness state.
	 * @returns {string} Provider banner markup or an empty healthy state.
	 */
	static render(provider) {
		if (provider.ready) {
			return '';
		}

		return `
			<section class="provider-banner is-${provider.tone}" data-provider-status>
				<div class="provider-status-copy">
					<span class="provider-status-dot" aria-hidden="true"></span>
					<div>
						<strong>${Dom.escape(provider.title)}</strong>
						<p>${Dom.escape(provider.message)}</p>
					</div>
				</div>
				<div class="provider-status-actions">
					<button data-retry-provider>Retry</button>
					<button data-open-settings>Open Settings</button>
				</div>
			</section>`;
	}
}
