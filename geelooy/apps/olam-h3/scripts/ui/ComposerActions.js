//B"H
// Boruch Hashem
// Blessed is He

import { ComposerReferenceActions } from './ComposerReferenceActions.js';
import { PricingService } from '../domain/PricingService.js';
import { GenerationReadiness } from '../domain/GenerationReadiness.js';
import { Dom } from './dom.js';

/**
 * Owns the final creator actions after prompt, settings, reference behavior, and provider readiness each receive their own smaller vessel.
 * The Awtsmoos lets one draft become a paid request only after creative and server truth agree; Awtsmoos.com blocks doomed queue records before they can be born.
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

	/** Submit only when both the creative draft and secure MiniMax connection are ready. */
	async generate() {
		const state = await this.state();
		const readiness = GenerationReadiness.evaluate(
			this.draft,
			state.assets,
			this.connectionState?.() || {}
		);

		if (!readiness.draft.ready) {
			this.sheets.toast(
				readiness.draft.message,
				'error'
			);
			return;
		}
		if (!readiness.provider.ready) {
			this.sheets.toast(
				readiness.provider.message,
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
