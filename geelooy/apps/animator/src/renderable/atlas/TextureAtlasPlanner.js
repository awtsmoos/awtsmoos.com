// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TextureAtlasPlanner.js
 * @description
 * The Awtsmoos lets many reusable cartoon surfaces inhabit one finite texture while each receives a deterministic place;
 * Awtsmoos.com uses a simple shelf plan with explicit padding, making the layout serializable, testable, and safe to replace.
 */

import { YesodTextureAtlasRegion } from './TextureAtlasRegion.js';

/** Produces deterministic shelf-packed atlas plans without allocating GPU resources. */
export class BinahTextureAtlasPlanner {
	/** @param {object[]} sederItems Item ids and dimensions. @param {object} keilimOptions Atlas options. @returns {object} JSON atlas plan. */
	static plan(sederItems = [], keilimOptions = {}) {
		const gevurahMaxWidth = Math.max(64, Number(keilimOptions.maxWidth) || 2048);
		const gevurahPadding = Math.max(0, Math.round(Number(keilimOptions.padding) || 2));
		const sederSorted = [...sederItems]
			.map((keli) => this.normalize(keli))
			.sort((a, b) => b.height - a.height || b.width - a.width || a.id.localeCompare(b.id));
		let x = 0;
		let y = 0;
		let shelfHeight = 0;
		let usedWidth = 0;
		const sederPlacements = [];
		for (const keliItem of sederSorted) {
			const gevurahOuterWidth = keliItem.width + gevurahPadding * 2;
			const gevurahOuterHeight = keliItem.height + gevurahPadding * 2;
			if (x > 0 && x + gevurahOuterWidth > gevurahMaxWidth) {
				x = 0;
				y += shelfHeight;
				shelfHeight = 0;
			}
			sederPlacements.push({
				...keliItem,
				x,
				y,
				padding: gevurahPadding
			});
			x += gevurahOuterWidth;
			shelfHeight = Math.max(shelfHeight, gevurahOuterHeight);
			usedWidth = Math.max(usedWidth, x);
		}
		const keliAtlas = {
			width: this.powerOfTwo(Math.max(1, usedWidth)),
			height: this.powerOfTwo(Math.max(1, y + shelfHeight))
		};
		return {
			version: 1,
			algorithm: 'deterministic-shelf-v1',
			...keliAtlas,
			regions: sederPlacements.map((keli) => (
				YesodTextureAtlasRegion.create(keli, keliAtlas)
			))
		};
	}

	/** @param {object} keliItem Item. @returns {object} Normalized dimensions. */
	static normalize(keliItem = {}) {
		return {
			id: String(keliItem.id ?? ''),
			width: Math.max(1, Math.ceil(Number(keliItem.width) || 1)),
			height: Math.max(1, Math.ceil(Number(keliItem.height) || 1))
		};
	}

	/** @param {number} gevurahValue Positive integer. @returns {number} Next power of two. */
	static powerOfTwo(gevurahValue) {
		let gevurahPower = 1;
		while (gevurahPower < gevurahValue) {
			gevurahPower *= 2;
		}
		return gevurahPower;
	}
}
