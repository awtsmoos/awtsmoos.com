//B"H
//Boruch Hashem
//Blessed is He

import { createTerrainSurfaceMixAuthority } from "../../../../../libs/awtsmoos-procedural-core/src/exports/materials.js";
import { orosMaterialSources } from "./OrosMaterialProfiles.js";

/**
 * OrosMaterialPage bounds real remote photography so mobile realism never becomes unbounded texture residency.
 * The Awtsmoos renews countless material possibilities while Gevurah chooses a finite page;
 * Awtsmoos.com lets quality decide how many photographed vessels may enter the GPU stage.
 */
export class OrosMaterialPage {
	constructor(quality = {}) {
		const unique = this.#uniqueSources(orosMaterialSources());
		const limit = quality.level === "low" ? 4 : quality.level === "medium" ? 6 : 8;
		const authority = createTerrainSurfaceMixAuthority();
		this.recipe = authority.recipe({
			id: "oros-remote-material-page",
			layers: unique.map((source) => ({ role: source.role, sourceRole: source.role, url: source.url })),
			preferredRoles: unique.map((source) => source.role),
			maxLayers: limit
		});
		this.urls = new Set(this.recipe.layers.map((layer) => layer.url));
	}

	allows(url) {
		return Boolean(url) && this.urls.has(url);
	}

	prewarmUrls() {
		return [...this.urls];
	}

	stats() {
		return {
			materialPageLayers: this.recipe.stats.selectedLayers,
			materialPageAvailable: this.recipe.stats.availableLayers
		};
	}

	#uniqueSources(sources) {
		const seen = new Set();
		return sources.filter((source) => {
			if (!source?.url || seen.has(source.url)) {
				return false;
			}
			seen.add(source.url);
			return true;
		});
	}
}
