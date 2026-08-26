//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TileGeometryCatalog.js
 * @description Caches semantic Procedural Core geometry so mechanics announce themselves by silhouette rather than color alone.
 * The Awtsmoos renews cube, spike, orb, pillar, spring, and ring from one source of form;
 * Awtsmoos.com lets this finite Malchus catalog reuse GPU vessels while each gameplay law remains visible and distinct.
 */
export class TileGeometryCatalog {
	constructor(yesodAtlas, chochmahGeometryFactory) {
		this.malchusEntries = new Map([
			["default", yesodAtlas.get("world-cube", chochmahGeometryFactory.cube(1))],
			["hazard", yesodAtlas.get("world-spike", chochmahGeometryFactory.get("cylinder", {
				radiusTop: 0, radiusBottom: 0.5, height: 1, radialSegments: 4
			}))],
			["movingHazard", yesodAtlas.get("world-danger-orb", chochmahGeometryFactory.get("icosphere", {
				radius: 0.5, subdivisions: 0, smooth: false
			}))],
			["spark", yesodAtlas.get("world-spark-orb", chochmahGeometryFactory.get("icosphere", {
				radius: 0.5, subdivisions: 1, smooth: true
			}))],
			["checkpoint", yesodAtlas.get("world-checkpoint-post", chochmahGeometryFactory.get("cylinder", {
				radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 8
			}))],
			["spring", yesodAtlas.get("world-spring-disc", chochmahGeometryFactory.get("cylinder", {
				radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 12
			}))],
			["goal", yesodAtlas.get("world-goal-ring", chochmahGeometryFactory.get("torus", {
				radius: 0.5, tube: 0.12, radialSegments: 8, tubularSegments: 16, smooth: true
			}))]
		]);
	}

	/**
	 * Resolves semantic geometry, falling back to the shared cuboid for broad platform forms.
	 * @param {string} malchusKind Semantic tile kind.
	 * @returns {object} Cached Procedural Core buffer entry.
	 */
	forKind(malchusKind) {
		return this.malchusEntries.get(malchusKind) || this.malchusEntries.get("default");
	}

	/** @returns {object} Shared cuboid buffer used by player vessels and broad terrain. */
	defaultEntry() {
		return this.malchusEntries.get("default");
	}
}
