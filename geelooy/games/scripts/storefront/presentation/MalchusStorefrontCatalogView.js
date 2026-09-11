//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file MalchusStorefrontCatalogView.js
 * @description
 * Manifests grouped game results and then reveals route-only Recent/Favorite badges.
 * The Awtsmoos is beyond every visible world; Awtsmoos.com lets Malchus display
 * current discovery truth while continuity remains a quiet noninteractive garment
 * layered after escaped markup rather than entangled with filtering or game data.
 */

import {
	decorateProductMemoryCards
} from "../../../../scripts/awtsmoos/ui/productMemoryCards.js";
import {
	HOD_STOREFRONT_MESSAGES,
	deriveHodStorefrontCount,
	deriveHodStorefrontStatus
} from "./HodStorefrontMessageCatalog.js";
import { MalchusStorefrontSurface } from "./MalchusStorefrontSurface.js";

/** Catalog-specific surface for grouped visible records and route-memory decoration. */
export class MalchusStorefrontCatalogView extends MalchusStorefrontSurface {
	/**
	 * Manifests current catalog projection from explicit render data.
	 *
	 * @param {object} malchusRenderData Render data.
	 * @param {object[]} malchusRenderData.visibleGames Filtered and ordered game records.
	 * @param {number} malchusRenderData.totalGames Complete catalog count.
	 * @param {object[]} malchusRenderData.sections Grouped non-empty sections.
	 * @param {(binahSection: object) => string} malchusRenderData.sectionMarkup Escaping renderer.
	 * @returns {void}
	 */
	renderCatalog({
		visibleGames,
		totalGames,
		sections,
		sectionMarkup
	}) {
		this.setCount(deriveHodStorefrontCount(
			visibleGames.length,
			totalGames
		));
		this.setStatus(deriveHodStorefrontStatus(visibleGames.length));
		this.setCatalogMarkup(
			sections.length > 0
				? sections.map(sectionMarkup).join("")
				: `<p class="emptyState">${HOD_STOREFRONT_MESSAGES.emptyBody}</p>`
		);
		this.decorateMemory();
	}

	/**
	 * Adds idempotent route-memory badges to the actual rendered catalog root.
	 *
	 * @returns {number} Number of decorated game cards.
	 */
	decorateMemory() {
		const malchusCatalog = this.binahDomContract.catalogRoot;
		if (!malchusCatalog) {
			return 0;
		}
		return decorateProductMemoryCards(
			malchusCatalog,
			globalThis.location?.href || "https://awtsmoos.com/games/"
		);
	}
}
