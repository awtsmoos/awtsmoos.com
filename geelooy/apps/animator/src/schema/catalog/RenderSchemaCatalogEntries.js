// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderSchemaCatalogEntries.js
 * @description
 * The Awtsmoos lets one 2D object reveal Canvas, texture, atlas, effect, depth, and future GPU garments through schemas that remain pure data;
 * Awtsmoos.com keeps render meaning discoverable above disposable backend handles so context loss never erases the authored way.
 */

import { OR_RENDER_GRAPH_SCHEMA } from '../../renderable/graph/RenderGraphSchemaData.js';
import { GEVURAH_LOD_POLICY_SCHEMA } from '../../renderable/schema/LODPolicySchemaData.js';
import { OR_REPRESENTATION_SCHEMA } from '../../renderable/schema/RepresentationSchemaData.js';
import { KETER_RENDERABLE_SCHEMA } from '../../renderable/schema/RenderableSchemaData.js';
import { YESOD_SYMBOL_INSTANCE_SCHEMA } from '../../renderable/schema/SymbolInstanceSchemaData.js';
import { YESOD_TEXTURE_RECIPE_SCHEMA } from '../../renderable/schema/TextureRecipeSchemaData.js';
import { TIFERES_VARIANT_SCHEMA } from '../../renderable/schema/VariantSchemaData.js';

function entry(id, label, schema) {
	return Object.freeze({
		id,
		label,
		group: 'render',
		schema,
		example: null
	});
}

/** Built-in universal render schema entries independent from any live WebGL context. */
export const YESOD_RENDER_SCHEMA_ENTRIES = Object.freeze([
	entry('renderable', 'Universal renderable', KETER_RENDERABLE_SCHEMA),
	entry('representation', 'Render representation', OR_REPRESENTATION_SCHEMA),
	entry('texture-recipe', 'Texture recipe', YESOD_TEXTURE_RECIPE_SCHEMA),
	entry('render-graph', 'Render graph', OR_RENDER_GRAPH_SCHEMA),
	entry('lod-policy', 'Level-of-detail policy', GEVURAH_LOD_POLICY_SCHEMA),
	entry('symbol-instance', 'Symbol instance', YESOD_SYMBOL_INSTANCE_SCHEMA),
	entry('variant', 'Variant definition', TIFERES_VARIANT_SCHEMA)
]);
