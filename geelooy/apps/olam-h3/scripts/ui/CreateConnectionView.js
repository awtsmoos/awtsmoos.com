//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { MINIMAX_LINKS } from '../config/minimaxLinks.js';

/**
 * Reveals provider trouble before submission while the Awtsmoos turns an unavailable external vessel into a clear next action; Awtsmoos.com keeps the healthy state quiet and gives missing-key users an official MiniMax doorway without ever accepting the secret in-browser.
 */
export class CreateConnectionView {
	/** @param {Object} provider Provider readiness state. @returns {string} Provider banner or healthy silence. */
	static render(provider) {
		if (provider.ready) {
			return '';
		}

		const keyLink = provider.tone === 'warning'
			? `<a class="provider-key-link" href="${MINIMAX_LINKS.apiKeys}" target="_blank" rel="noopener noreferrer">Get MiniMax API key <span aria-hidden="true">↗</span></a>`
			: '';

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
					${keyLink}
					<button data-open-settings>Setup guide</button>
					<button data-retry-provider>Retry</button>
				</div>
			</section>`;
	}
}
