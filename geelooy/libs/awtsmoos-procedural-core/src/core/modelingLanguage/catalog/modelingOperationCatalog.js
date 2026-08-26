//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file modelingOperationCatalog.js
 * @description Unifies core transforms, proven Awtsmoos native deformations, and Blender modifier descriptors into one truthful searchable modeling vocabulary.
 * The Awtsmoos renews every possible deformation while Awtsmoos.com refuses to confuse representable intent with proven execution;
 * each operation therefore carries source, capability, aliases, and native definition identity in honest connection.
 */

import { CORE_BEND_MODIFIER_ID } from "../../proceduralObject/modifiers/builtins/bendModifier.js";
import { CORE_SHEAR_MODIFIER_ID } from "../../proceduralObject/modifiers/builtins/shearModifier.js";
import { CORE_TAPER_MODIFIER_ID } from "../../proceduralObject/modifiers/builtins/taperModifier.js";
import { CORE_TWIST_MODIFIER_ID } from "../../proceduralObject/modifiers/builtins/twistModifier.js";
import { BLENDER_MODIFIER_CATALOG } from "../../proceduralObject/modifiers/blenderModifierCatalog.js";
import { MODELING_EXECUTION } from "../constants/modelingContract.js";

const CORE_OPERATIONS = Object.freeze([
	coreOperation("translate", ["translate", "move"], "transform"),
	coreOperation("rotate", ["rotate", "rotation"], "transform"),
	coreOperation("scale", ["scale", "resize"], "transform"),
	coreOperation("parent", ["parent", "attach"], "hierarchy"),
	nativeModifier("twist", ["twist", "twisted"], CORE_TWIST_MODIFIER_ID),
	nativeModifier("taper", ["taper", "tapered"], CORE_TAPER_MODIFIER_ID),
	nativeModifier("bend", ["bend", "bent"], CORE_BEND_MODIFIER_ID),
	nativeModifier("shear", ["shear", "skew"], CORE_SHEAR_MODIFIER_ID)
]);

export const MODELING_OPERATIONS = Object.freeze([
	...CORE_OPERATIONS,
	...BLENDER_MODIFIER_CATALOG.map((gevurahDefinition) => projectBlenderModifier(gevurahDefinition))
]);

/**
 * Finds an operation by canonical id or any human/adapter alias contained in searchable text.
 * @param {string} chochmahText Searchable modeling text.
 * @returns {object|null} Matching operation definition.
 */
export function findModelingOperation(chochmahText = "") {
	const binahNeedle = String(chochmahText).toLowerCase();
	return MODELING_OPERATIONS.find((tiferesOperation) => {
		return tiferesOperation.id === binahNeedle
			|| tiferesOperation.aliases.some((yesodAlias) => binahNeedle.includes(yesodAlias));
	}) || null;
}

/**
 * Creates one native semantic operation that does not use the modifier executor registry.
 * @param {string} chochmahId Stable semantic operation id.
 * @param {Array<string>} binahAliases Searchable human aliases.
 * @param {string} tiferesCategory Semantic category.
 * @returns {object} Frozen native operation descriptor.
 */
function coreOperation(chochmahId, binahAliases, tiferesCategory) {
	return Object.freeze({
		id: chochmahId,
		title: chochmahId,
		aliases: binahAliases,
		category: tiferesCategory,
		execution: MODELING_EXECUTION.NATIVE,
		source: "core"
	});
}

/**
 * Creates one modeling operation backed by a proven local modifier executor.
 * @param {string} chochmahId Human modeling operation id.
 * @param {Array<string>} binahAliases Human aliases.
 * @param {string} yesodDefinitionId Native modifier definition id.
 * @returns {object} Frozen native modifier operation descriptor.
 */
function nativeModifier(chochmahId, binahAliases, yesodDefinitionId) {
	return Object.freeze({
		id: chochmahId,
		title: chochmahId,
		aliases: binahAliases,
		category: "deform",
		execution: MODELING_EXECUTION.NATIVE,
		source: "core-native",
		definitionId: yesodDefinitionId
	});
}

/**
 * Projects an existing Blender modifier definition into the renderer-neutral modeling vocabulary.
 * @param {object} gevurahDefinition Existing Blender modifier definition.
 * @returns {object} Frozen searchable Blender projection.
 */
function projectBlenderModifier(gevurahDefinition) {
	const malchusName = gevurahDefinition.metadata?.blenderName
		|| gevurahDefinition.id.split(".").at(-1);
	return Object.freeze({
		id: malchusName,
		title: gevurahDefinition.title,
		aliases: [malchusName, gevurahDefinition.title.toLowerCase()],
		category: gevurahDefinition.category,
		execution: gevurahDefinition.status === "implemented"
			? MODELING_EXECUTION.NATIVE
			: MODELING_EXECUTION.ADAPTER,
		source: "blender-catalog",
		timeDependent: Boolean(gevurahDefinition.timeDependent),
		definitionId: gevurahDefinition.id
	});
}
