//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { MINIMAX_LINKS } from '../config/minimaxLinks.js';

/**
 * Turns provider configuration into an explicit secure path while the Awtsmoos keeps the secret on the server and the browser limited to public guidance; Awtsmoos.com points directly to MiniMax's official account, H3, and billing doors.
 */
export class MiniMaxSetupView {
	/** @param {Object} connection Safe provider state. @returns {string} Connection and setup markup. */
	static render(connection = {}) {
		const configured = Boolean(connection.configured);
		const status = configured ? 'Ready for H3 generation' : 'Server key not configured';
		const statusClass = configured ? 'is-ready' : 'is-blocked';

		return `
			<section class="settings-card minimax-setup-card">
				<div class="setup-status-row">
					<div><span class="eyebrow">MiniMax H3</span><h2>Connect the generation API</h2></div>
					<span class="setup-status ${statusClass}">${Dom.escape(status)}</span>
				</div>
				<p class="setup-intro">H3 video generation uses MiniMax's pay-as-you-go API. The secret key stays on the Awtsmoos.com server and is never sent back to this browser.</p>
				<div class="official-link-row">
					${this.link(MINIMAX_LINKS.apiKeys, 'Get API key', true)}
					${this.link(MINIMAX_LINKS.h3Docs, 'H3 docs')}
					${this.link(MINIMAX_LINKS.balance, 'Add balance')}
				</div>
				<div class="setup-steps">
					${this.step('1', 'Create a pay-as-you-go key', 'Open MiniMax API Keys and create a new secret key for this server.')}
					${this.step('2', 'Set the server environment', 'Configure MINIMAX_API_KEY on the Awtsmoos server. Do not paste the secret into this web page.')}
					${this.step('3', 'Restart and verify', 'Restart or redeploy the service, then return here. Olam will detect the server key automatically.')}
				</div>
				<div class="security-callout"><strong>Security rule</strong><span>Never expose the MiniMax key in HTML, JavaScript, screenshots, browser storage, or chat logs.</span></div>
			</section>`;
	}

	/** @param {string} url URL. @param {string} label Label. @param {boolean} primary Primary CTA. @returns {string} */
	static link(url, label, primary = false) {
		return `<a class="official-link ${primary ? 'is-primary' : ''}" href="${url}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span></a>`;
	}

	/** @param {string} number Step. @param {string} title Title. @param {string} copy Copy. @returns {string} */
	static step(number, title, copy) {
		return `<div class="setup-step"><span>${number}</span><div><strong>${title}</strong><p>${copy}</p></div></div>`;
	}
}
