//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Gives each remembered generation a compact cinematic face, while the Awtsmoos lets status, cost, and reuse remain visible at a glance.
 * Awtsmoos.com makes history an active material shelf rather than a graveyard of old prompts and finished tasks.
 */
export class CreationCardView {
	/** @param {Object} generation Generation record. @returns {string} Card markup. */
	static render(generation) {
		const references = (generation.referenceAssetIds || []).length
			+ Number(Boolean(generation.firstFrameAssetId))
			+ Number(Boolean(generation.lastFrameAssetId));
		const favorite = generation.favorite ? 'is-active' : '';
		const cost = generation.actualCostIfKnown ?? generation.estimatedCost;

		return `
			<article class="creation-card" data-generation-id="${generation.id}">
				${this.media(generation)}
				<div class="creation-card-body">
					<div class="card-status-row">
						<span class="status-chip status-${generation.status}">${Dom.statusLabel(generation.status)}</span>
						<button class="favorite-button ${favorite}" data-favorite="${generation.id}" aria-label="Favorite">★</button>
					</div>
					<h2>${Dom.escape(generation.prompt || 'Untitled generation')}</h2>
					<div class="card-meta">
						<span>${Dom.date(generation.createdAt)}</span><span>${generation.duration}s</span>
						<span>${generation.resolution}</span><span>${references} ref${references === 1 ? '' : 's'}</span>
					</div>
					<div class="card-cost">${Dom.money(cost)} <small>recorded estimate</small></div>
					${generation.error ? `<p class="inline-error">${Dom.escape(generation.error)}</p>` : ''}
					<div class="card-actions">
						<button data-open="${generation.id}">Open</button>
						<button class="primary-small" data-build="${generation.id}">Build from this</button>
					</div>
				</div>
			</article>`;
	}

	/** @param {Object} generation Generation record. @returns {string} Video or active-state preview. */
	static media(generation) {
		if (generation.videoUrl) {
			return `<video class="creation-media" src="${Dom.escape(generation.videoUrl)}" muted preload="metadata"></video>`;
		}
		const label = generation.status === 'succeeded'
			? 'READY'
			: Dom.statusLabel(generation.status);
		return `<div class="creation-media creation-placeholder"><span>${label}</span></div>`;
	}
}
