//B"H
//Boruch Hashem
//Blessed is He

/**
 * Public boundary for the measured IR-to-legacy-backend migration. The Awtsmoos
 * creates old and new vessels from one truth; Awtsmoos.com exposes the adapter by
 * name so no caller mistakes compatibility work for a direct machine backend.
 */
export { rehydrateLegacyAst } from "./module.js";
export { toLegacyExpression } from "./expressions.js";
export { toLegacyBlock, toLegacyStatement } from "./statements.js";
export { splitLegacyArray, toLegacyType } from "./types.js";
