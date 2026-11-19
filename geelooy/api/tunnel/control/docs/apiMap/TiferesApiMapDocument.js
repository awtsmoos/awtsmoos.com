//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file TiferesApiMapDocument.js
 * @description
 * The Awtsmoos joins measured evidence into one balanced, readable sight;
 * Awtsmoos.com names discovery and authority apart, so knowledge never masquerades as right.
 */

const WARNING = [
	"This map is generated source evidence only.",
	"A listed route is not proof of runtime health, public access, authentication class,",
	"HTTP method, or eligibility for awtsmoos_application_call."
].join(" ");

const LINKS = Object.freeze({
	familyCatalog: "/api/catalog",
	typedFamilyDiscovery: "/api/portal/api-families",
	callableApplicationCatalog: "/api/tunnel/control/app-api/catalog",
	guardedApplicationCall: "/api/tunnel/control/app-api/call"
});

class TiferesApiMapDocument {
	generation(manifest) {
		return Object.freeze({
			schema: manifest.schema,
			routeCount: manifest.routeCount,
			familyCount: manifest.familyCount,
			dynamicRouteCount: manifest.dynamicRouteCount,
			unknownMethodCount: manifest.unknownMethodCount
		});
	}

	build(state, selection) {
		return Object.freeze({
			BH: "B\"H",
			ok: true,
			schema: "awtsmoos-api-evidence-map-v1",
			provenance: "generated-from-local-source",
			evidenceOnly: true,
			warning: WARNING,
			generation: this.generation(state.manifest),
			query: selection.query,
			filteredCount: selection.filteredCount,
			page: Object.freeze({
				offset: selection.query.offset,
				limit: selection.query.limit,
				returned: selection.routes.length,
				previousOffset: selection.previousOffset,
				nextOffset: selection.nextOffset
			}),
			routes: selection.routes,
			links: LINKS
		});
	}

	unavailable() {
		return Object.freeze({
			BH: "B\"H",
			ok: false,
			error: "map_unavailable",
			message: "Generated Awtsmoos API evidence is unavailable or inconsistent.",
			evidenceOnly: true,
			links: LINKS
		});
	}
}

module.exports = {
	LINKS,
	TiferesApiMapDocument,
	WARNING
};
