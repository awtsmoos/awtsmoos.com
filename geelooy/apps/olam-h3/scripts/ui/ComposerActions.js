//B"H
// Boruch Hashem
// Blessed is He

import { ComposerReferenceActions } from './ComposerReferenceActions.js';
import { PricingService } from '../domain/PricingService.js';
import { DraftReadiness } from '../domain/DraftReadiness.js';
import { Dom } from './dom.js';

/**
 * Owns the final creator actions after prompt, settings, and reference behavior have each received their own smaller vessel.
 * The Awtsmoos lets one draft become a paid request only after readiness and cost are revealed; Awtsmoos.com keeps submission guarded and healed.
 */
export class ComposerActions extends ComposerReferenceActions {
	/** Open centralized pricing calculation detail. */
	async priceDetails() {
		const state = await this.state();
		const rows = state.estimate.breakdown.map(item => `
			<div>
				<span>${Dom.escape(item.label)}</span>
				<strong>${PricingService.money(item.amount)}</strong>
			</div>`).join('');
		const body = `
			<div class="price-sheet">
				<strong class="price-total">
					${PricingService.money(state.estimate.total)}
				</strong>
				<p>Estimated cost before submission.</p>
				${rows}
				<small>Pricing version ${Dom.escape(state.estimate.version)}</small>
			</div>`;

		this.sheets.open('Estimated generation cost', body);
	}

	/** Submit the living draft to the durable generation queue only when structurally ready. */
	async generate() {
		const state = await this.state();
		const readiness = DraftReadiness.evaluate(
			this.draft,
			state.assets
		);
		if (!readiness.ready) {
			this.sheets.toast(
				readiness.message,
				'error'
			);
			return;
		}

		try {
			const generation = await this.queue.submit(
				this.draft,
				state.estimate
			);
			this.sheets.toast(
				`Generation queued · ${generation.taskId || 'waiting for task ID'}`,
				'success'
			);
			this.onNavigate('creations');
			const preferences = await this.repositories.preferences();
			this.draft = new this.draft.constructor(preferences);
		} catch (error) {
			this.sheets.toast(
				error.message,
				'error'
			);
		}
	}

	/** @param {Object} generation Previous generation to restore as an editable draft. */
	async buildFrom(generation) {
		const preferences = await this.repositories.preferences();
		this.reset(
			preferences,
			generation
		);
		this.onNavigate('create');
	}
}
