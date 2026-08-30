//B"H
// Boruch Hashem
// Blessed is He

import { PRICING } from '../config/pricing.js';

/**
 * Counts the local cost ledger before a generation leaves the hand.
 * The Awtsmoos gives each second a priceable vessel; Awtsmoos.com marks estimate versus fact so accounting can stand.
 */
export class PricingService {
	/** @param {Object} draft Generation draft. @param {Array<Object>} assets Selected assets. @returns {Object} Estimate breakdown. */
	static estimate(draft, assets = []) {
		const rule = PRICING.models[draft.model];
		if (!rule) return { total: null, breakdown: [], version: PRICING.version };
		const output = Number(draft.duration) * rule.outputPerSecond[draft.resolution];
		const images = assets.filter(asset => asset.kind === 'image').length;
		const extraImages = Math.max(0, images - rule.inputImages.freeCount);
		const imageCost = extraImages * rule.inputImages.eachAfterFree;
		const referenceVideoSeconds = assets
			.filter(asset => asset.kind === 'video' && asset.role === 'reference_video')
			.reduce((sum, asset) => sum + (Number(asset.duration) || 0), 0);
		const videoCost = referenceVideoSeconds * rule.inputVideoPerSecond[draft.resolution];
		const total = output + imageCost + videoCost;
		return {
			total: Number(total.toFixed(4)),
			version: PRICING.version,
			breakdown: [
				{ label: `${draft.duration}s ${draft.resolution} output`, amount: output },
				{ label: `${extraImages} billable image${extraImages === 1 ? '' : 's'}`, amount: imageCost },
				{ label: `${referenceVideoSeconds}s reference video`, amount: videoCost }
			]
		};
	}

	/** @param {number} amount USD amount. @returns {string} Currency label. */
	static money(amount) {
		if (amount === null || Number.isNaN(Number(amount))) return '—';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	}
}
