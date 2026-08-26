//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusStorefrontCatalogView.js
 * @description Extends the shared surface with count, status, grouped markup, and empty-state manifestation.
 * The Awtsmoos is beyond every visible world while Malchus lets matching doorways gather without owning filter decree;
 * Awtsmoos.com keeps rendering downstream from data so empty and ready states remain simple for every screen to see.
 */
import {
	HOD_STOREFRONT_MESSAGES,
	deriveHodStorefrontCount,
	deriveHodStorefrontStatus
} from './HodStorefrontMessageCatalog.js';
import { MalchusStorefrontSurface } from './MalchusStorefrontSurface.js';

/** Catalog-specific surface for grouped visible records. */
export class MalchusStorefrontCatalogView extends MalchusStorefrontSurface {
	/**
	 * Manifests current catalog projection from explicit render data without reading input or filter state from DOM.
	 * @param {object} malchusRenderData Render data.
	 * @param {object[]} malchusRenderData.visibleGames Filtered game records.
	 * @param {number} malchusRenderData.totalGames Complete catalog count.
	 * @param {object[]} malchusRenderData.sections Grouped non-empty sections.
	 * @param {(binahSection: object) => string} malchusRenderData.sectionMarkup Escaping section renderer.
	 * @returns {void}
	 */
	renderCatalog({ visibleGames, totalGames, sections, sectionMarkup }) {
		this.setCount(deriveHodStorefrontCount(visibleGames.length, totalGames));
		this.setStatus(deriveHodStorefrontStatus(visibleGames.length));
		this.setCatalogMarkup(
			sections.length > 0
				? sections.map(sectionMarkup).join('')
				: `<p class="emptyState">${HOD_STOREFRONT_MESSAGES.emptyBody}</p>`
		);
	}
}
