// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureSemanticRulesMade.js
 * @description Declares overlapping semantic evidence for manufactured, architectural, textile, polymer, and industrial materials.
 * Awtsmoos.com lets one finite surface answer many truthful questions without forcing AI to guess a single folder from a complicated human-made world.
 */

export const AWTSMOOS_MADE_TEXTURE_RULES = Object.freeze([
	rule(['aluminum', 'aluminium'], ['metal', 'industrial', 'construction'], ['nonferrous-metal'], ['aluminum', 'metal']),
	rule(['steel', 'iron'], ['metal', 'industrial', 'construction'], ['ferrous-metal'], ['ferrous', 'metal']),
	rule(['brass', 'bronze', 'copper'], ['metal', 'industrial', 'craft', 'construction'], ['copper-alloy'], ['metal', 'nonferrous']),
	rule(['silver', 'gold', 'titanium', 'zinc', 'nickel', 'tin', 'lead'], ['metal', 'industrial', 'craft'], ['metal'], ['metallic', 'solid']),
	rule(['galvanized'], ['metal', 'industrial', 'construction'], ['coated-metal'], ['zinc-coated', 'metallic']),
	rule(['corrugated sheet'], ['metal', 'construction', 'industrial'], ['sheet-metal'], ['corrugated', 'formed-metal']),
	rule(['metal mesh', 'woven metal mesh'], ['metal', 'industrial'], ['mesh'], ['woven-metal', 'perforated']),
	rule(['glass'], ['glass', 'architecture', 'construction'], ['glass'], ['transparent-material', 'silicate']),
	rule(['ceramic', 'terracotta', 'porcelain'], ['ceramic', 'construction', 'craft'], ['fired-mineral'], ['ceramic', 'mineral-based']),
	rule(['brick', 'masonry', 'mortar', 'adobe', 'rammed earth'], ['construction', 'architecture'], ['masonry'], ['building-material', 'wall-material']),
	rule(['concrete', 'cement'], ['construction', 'architecture', 'industrial'], ['concrete'], ['cementitious', 'mineral-based']),
	rule(['asphalt'], ['construction', 'terrain', 'industrial'], ['paving'], ['road-material', 'bituminous']),
	rule(['rubber', 'latex'], ['polymer', 'industrial'], ['elastomer'], ['flexible', 'polymer']),
	rule(['plastic', 'polymer', 'pvc', 'vinyl', 'acrylic', 'polycarbonate'], ['polymer', 'industrial'], ['plastic'], ['synthetic', 'polymer']),
	rule(['fiberglass'], ['composite', 'industrial', 'construction'], ['fiber-composite'], ['glass-fiber', 'composite']),
	rule(['carbon fiber'], ['composite', 'industrial'], ['carbon-composite'], ['woven-fiber', 'composite']),
	rule(['foam'], ['polymer', 'industrial'], ['foam'], ['porous', 'cellular', 'lightweight']),
	rule(['canvas', 'cotton', 'linen', 'wool', 'denim', 'velvet', 'silk', 'felt'], ['textile', 'craft'], ['fabric'], ['woven', 'fiber', 'cloth']),
	rule(['jute', 'burlap', 'hemp'], ['textile', 'craft', 'plant-derived'], ['coarse-fabric'], ['woven', 'fiber', 'natural-fiber']),
	rule(['suede', 'leather'], ['textile', 'craft', 'animal-derived'], ['leather'], ['hide', 'organic', 'flexible']),
	rule(['paper', 'cardboard', 'parchment'], ['paper', 'craft'], ['cellulose-sheet'], ['cellulose', 'fiber', 'sheet']),
	rule(['carpet'], ['textile', 'architecture'], ['carpet'], ['pile', 'fiber', 'flooring']),
	rule(['rope', 'cordage'], ['textile', 'craft'], ['rope'], ['twisted-fiber', 'cordage']),
	rule(['paint'], ['coating', 'construction', 'craft'], ['paint'], ['pigmented', 'coating']),
	rule(['printed circuit', 'circuit board', 'pcb'], ['electronics', 'industrial'], ['circuit-board'], ['electronics', 'manufactured']),
	rule(['scratch', 'fracture network'], ['mask', 'surface-detail'], ['procedural-mask'], ['mask', 'detail-map']),
	rule(['mineral wool', 'rock wool'], ['insulation', 'construction', 'industrial'], ['mineral-fiber'], ['fibrous', 'insulation'])
]);

/** Builds one immutable semantic rule from simple filename evidence. */
function rule(keywords, categories, subcategories, labels) {
	return Object.freeze({
		categories: Object.freeze(categories),
		keywords: Object.freeze(keywords),
		labels: Object.freeze(labels),
		subcategories: Object.freeze(subcategories)
	});
}
