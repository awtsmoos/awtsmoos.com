//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file lowerModelingObjectCommands.js
 * @description Orchestrates primitive creation, immutable native modifier staging, final object creation, and explicit preservation of every unlowered semantic operation.
 * The Awtsmoos renews geometry before object while Awtsmoos.com lets each focused lowerer keep its own law;
 * one small orchestration vessel now reveals more power precisely because it no longer tries to contain it all.
 */

import { collectDeferredModelingOperations } from "./collectDeferredModelingOperations.js";
import { createModelingCommand } from "./createModelingCommand.js";
import { lowerNativeModifierStage } from "./lowerNativeModifierStage.js";

/**
 * Lowers one semantic object into trusted primitive/modifier/object commands and explicit uncertainties.
 * @param {object} chochmahObject Semantic ModelingObject.
 * @param {number} malchusStartIndex Starting command index.
 * @returns {object} Commands, deferred operation records, and next command index.
 */
export function lowerModelingObjectCommands(chochmahObject, malchusStartIndex = 0) {
	const binahPrimitive = chochmahObject.primitive;
	if (!binahPrimitive?.nativeOperation) {
		return lowerUnsupportedPrimitive(chochmahObject, malchusStartIndex);
	}
	let yesodIndex = malchusStartIndex;
	const tiferesCommands = [];
	const malchusPrimitiveGeometryId = `${chochmahObject.id}.geometry`;
	const malchusPrimitiveCommand = createModelingCommand(
		yesodIndex++,
		binahPrimitive.nativeOperation,
		malchusPrimitiveGeometryId,
		binahPrimitive.params || {}
	);
	tiferesCommands.push(malchusPrimitiveCommand);
	const gevurahModifierStage = lowerNativeModifierStage(
		chochmahObject,
		malchusPrimitiveGeometryId,
		malchusPrimitiveCommand.id,
		yesodIndex
	);
	tiferesCommands.push(...gevurahModifierStage.commands);
	yesodIndex = gevurahModifierStage.nextIndex;
	tiferesCommands.push(createObjectCommand(
		chochmahObject,
		gevurahModifierStage.finalGeometryId,
		gevurahModifierStage.finalDependencyId,
		yesodIndex++
	));
	return {
		commands: tiferesCommands,
		deferred: collectDeferredModelingOperations(
			chochmahObject,
			gevurahModifierStage.executedOperationIds
		),
		nextIndex: yesodIndex
	};
}

/**
 * Preserves a non-native primitive and every enabled operation without emitting invalid commands.
 * @param {object} chochmahObject Semantic object.
 * @param {number} malchusStartIndex Current command index.
 * @returns {object} Empty command list with complete uncertainty evidence.
 */
function lowerUnsupportedPrimitive(chochmahObject, malchusStartIndex) {
	return {
		commands: [],
		deferred: [
			{
				objectId: chochmahObject.id,
				reason: "primitive-not-native",
				primitive: chochmahObject.primitive
			},
			...collectDeferredModelingOperations(chochmahObject)
		],
		nextIndex: malchusStartIndex
	};
}

/**
 * Creates the final scene object command referencing the last proven geometry stage.
 * @param {object} chochmahObject Semantic object.
 * @param {string} binahGeometryId Final geometry stage id.
 * @param {string} tiferesDependencyId Command that produced the final geometry.
 * @param {number} yesodIndex Command index.
 * @returns {object} Generic create_object command.
 */
function createObjectCommand(
	chochmahObject,
	binahGeometryId,
	tiferesDependencyId,
	yesodIndex
) {
	return createModelingCommand(
		yesodIndex,
		"create_object",
		chochmahObject.id,
		{
			type: "mesh",
			name: chochmahObject.name,
			geometryId: binahGeometryId,
			materialIds: chochmahObject.material ? [chochmahObject.material] : [],
			transform: {
				position: chochmahObject.transform.position,
				rotation_degrees: chochmahObject.transform.rotation,
				scale: chochmahObject.transform.scale
			}
		},
		[tiferesDependencyId]
	);
}
