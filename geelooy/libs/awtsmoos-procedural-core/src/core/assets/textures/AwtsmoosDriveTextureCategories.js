// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureCategories.js
 * @description Exposes an exhaustive AI-facing taxonomy while actual classification remains overlapping and facet-rich.
 * The Awtsmoos is beyond every category; Awtsmoos.com documents every semantic domain the classifier may emit so agents never encounter an unnamed drawer.
 */

import { classifyAwtsmoosDriveTextureSemantics } from './AwtsmoosDriveTextureSemantics.js';

const TREE = Object.freeze({
	'animal-derived': group({ leather: 'Leather, suede, hide, and other animal-derived materials' }),
	architecture: group({ glass: 'Architectural glass', masonry: 'Brick, stone, mortar, paving, and walls', metal: 'Architectural metals', roofing: 'Roof coverings and shingles', timber: 'Structural wood and timber' }),
	biology: group({ 'animal-surface': 'Animal-derived surfaces', biomineral: 'Shell, nacre, and related biominerals', bone: 'Bone materials', flower: 'Flowers and petals', foliage: 'Plant foliage and ground growth' }),
	carbon: group({ 'carbon-material': 'Coal, charcoal, graphite, soot, and carbon-rich surfaces' }),
	ceramic: group({ 'fired-mineral': 'Ceramic, terracotta, and porcelain surfaces' }),
	coating: group({ paint: 'Paint and applied pigmented films' }),
	composite: group({ 'carbon-composite': 'Carbon-fiber composites', 'fiber-composite': 'Fiberglass and fiber composites' }),
	construction: group({ concrete: 'Concrete and cementitious surfaces', masonry: 'Masonry and earth construction', 'mineral-fiber': 'Mineral insulation fibers', paving: 'Road and paving materials', 'sheet-metal': 'Formed sheet metal' }),
	craft: group({ 'cellulose-sheet': 'Paper and parchment', fabric: 'General fabric surfaces', leather: 'Leather and suede', resin: 'Resins used in craft', rope: 'Rope and cordage', wax: 'Wax materials' }),
	creatures: group({ 'animal-surface': 'Fur, hide, scales, horn, feather, and related surfaces', bone: 'Bone materials' }),
	cryosphere: group({ 'frozen-water': 'Snow and ice' }),
	electronics: group({ 'circuit-board': 'Printed circuit board surfaces' }),
	geology: group({ crystal: 'Crystalline minerals', rock: 'General rock and stone', 'sedimentary-rock': 'Sedimentary materials', stone: 'Stone materials', 'volcanic-rock': 'Volcanic materials' }),
	glass: group({ glass: 'Transparent and translucent glass materials' }),
	industrial: group({ elastomer: 'Rubber and elastomers', metal: 'Industrial metals', oil: 'Industrial oils', plastic: 'Industrial polymers' }),
	insulation: group({ 'mineral-fiber': 'Mineral wool and related insulation' }),
	liquid: group({ oil: 'Oil and lubricant liquids', 'water-surface': 'Water surfaces' }),
	mask: group({ 'procedural-mask': 'Reusable isolated surface-detail masks' }),
	metal: group({ 'coated-metal': 'Coated metals', 'ferrous-metal': 'Iron and steel', 'nonferrous-metal': 'Aluminum and other nonferrous metals', 'sheet-metal': 'Formed sheet metal' }),
	mineral: group({ biomineral: 'Biological mineral surfaces', crystal: 'Crystalline minerals', mineral: 'Mineral substances' }),
	organic: group({ resin: 'Resin and amber', sponge: 'Natural sponge', wax: 'Natural wax materials' }),
	paper: group({ 'cellulose-sheet': 'Paper, cardboard, and parchment' }),
	particulate: group({ 'fine-particles': 'Powders, dusts, ash, and granular fines' }),
	'plant-derived': group({ 'coarse-fabric': 'Jute, burlap, hemp, and plant fibers', 'wood-surface': 'Wood and timber' }),
	polymer: group({ elastomer: 'Rubber and flexible polymers', foam: 'Polymer foams', plastic: 'Rigid and molded polymers' }),
	'surface-detail': group({ 'procedural-mask': 'Scratch, fracture, and other isolated detail masks' }),
	terrain: group({ aggregate: 'Gravel and pebbles', 'frozen-water': 'Snow and ice', paving: 'Paving and asphalt', rock: 'Rock and bedrock', soil: 'Soils, earth, clay, and mud' }),
	textile: group({ carpet: 'Carpet pile', 'coarse-fabric': 'Jute, burlap, and hemp', fabric: 'Woven and knitted textiles', leather: 'Leather and suede', rope: 'Rope and cordage' }),
	vegetation: group({ bark: 'Bark and cork', flower: 'Flowers and petals', foliage: 'Leaves, grass, moss, fern, and algae' }),
	water: group({ 'frozen-water': 'Ice and snow', surface: 'Water surfaces', 'water-surface': 'Water surfaces' }),
	wood: group({ bark: 'Bark and cork', 'wood-surface': 'Wood, timber, and plywood' })
});

export const AWTSMOOS_DRIVE_TEXTURE_TAXONOMY = Object.freeze(Object.entries(TREE).flatMap(([category, children]) => Object.keys(children).map(subcategory => Object.freeze({ category, subcategory }))));

/** Returns overlapping semantics while preserving legacy primary category fields. */
export function classifyAwtsmoosDriveTexture(record = {}) { return classifyAwtsmoosDriveTextureSemantics(record); }
/** Returns the complete category map for AI planning and inspection. */
export function awtsmoosDriveTextureCategoryTree() { return TREE; }
function group(children) { return Object.freeze(children); }
