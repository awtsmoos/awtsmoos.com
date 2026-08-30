//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { PRICING } from '../config/pricing.js';

/**
 * Reveals pricing provenance and backup boundaries while the Awtsmoos lets financial memory and portable metadata remain honest.
 * Awtsmoos.com never disguises local estimates as provider billing and never hides enormous binary files inside ordinary JSON.
 */
export class SettingsDataSections {
	/** @returns {string} Centralized pricing provenance section. */
	static pricing() {
		const model = PRICING.models['MiniMax-H3'];
		const price768 = Dom.money(
			model.outputPerSecond['768P']
		);
		const price2k = Dom.money(
			model.outputPerSecond['2K']
		);
		const extraImage = Dom.money(
			model.inputImages.eachAfterFree
		);

		return `
			<section class="settings-card">
				<h2>Pricing configuration</h2>
				<p>
					Verified ${PRICING.verifiedAt}.
					H3 768P ${price768}/s · 2K ${price2k}/s.
					First 5 input images are free, then ${extraImage} each.
				</p>
				<small>
					Version ${Dom.escape(PRICING.version)} · local estimates, not a MiniMax invoice
				</small>
			</section>`;
	}

	/** @returns {string} Backup and destructive-data controls. */
	static backup() {
		return `
			<section class="settings-card">
				<h2>Backup & data</h2>
				<div class="settings-actions">
					<button data-export>Export metadata JSON</button>
					<button data-import>Import metadata JSON</button>
					<input
						class="visually-hidden"
						type="file"
						accept="application/json"
						data-import-file
					>
					<button class="danger-button" data-clear-history>
						Clear generation history
					</button>
				</div>
				<p>
					Metadata backups exclude large local Blobs/videos.
					Asset metadata and public source URLs remain portable.
				</p>
			</section>`;
	}
}
