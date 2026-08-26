//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file geometryModifierHandlers.js
 * @description Bridges generic ProceduralObject geometry commands into the existing immutable native modifier-stack engine.
 * The Awtsmoos renews source geometry before each ordered deformation may descend;
 * Awtsmoos.com preserves the old vessel, stores a new stage, and records every applied footprint at the end.
 */

import { createDefaultModifierExecutorRegistry } from "../modifiers/createDefaultModifierExecutorRegistry.js";
import { createModifierStack } from "../modifiers/createModifierStack.js";
import { evaluateModifierStack } from "../modifiers/evaluateModifierStack.js";
import { requireGeometry, storeGeometry } from "./contextHelpers.js";

const yesodNativeModifierRegistry = createDefaultModifierExecutorRegistry();

/**
 * Registers immutable native modifier-stack execution as a core geometry operation.
 * @param {object} yesodOperationRegistry Trusted ProceduralOperationRegistry-compatible destination.
 * @returns {object} The same operation registry for fluent composition.
 */
export function registerGeometryModifierHandlers(yesodOperationRegistry) {
	yesodOperationRegistry.register("apply_modifier_stack", {
		handler: (malchusContext, chochmahCommand) => {
			return applyNativeModifierStack(malchusContext, chochmahCommand);
		}
	});
	return yesodOperationRegistry;
}

/**
 * Evaluates one ordered native modifier stack from a source geometry into a distinct command target.
 * @param {object} malchusContext Mutable compiler context owned by ProceduralObjectCompiler.
 * @param {object} chochmahCommand Validated generic command record.
 * @returns {object} Newly stored target geometry artifact.
 */
function applyNativeModifierStack(malchusContext, chochmahCommand) {
	const binahSourceGeometryId = String(
		chochmahCommand.args.sourceGeometryId
			?? chochmahCommand.args.source
			?? ""
	);
	if (!binahSourceGeometryId) {
		throw new TypeError("apply_modifier_stack requires sourceGeometryId.");
	}
	if (binahSourceGeometryId === chochmahCommand.target) {
		throw new Error("apply_modifier_stack source and target geometry ids must differ.");
	}
	const tiferesModifiers = chochmahCommand.args.modifiers ?? [];
	if (!Array.isArray(tiferesModifiers) || !tiferesModifiers.length) {
		throw new TypeError("apply_modifier_stack requires at least one modifier.");
	}
	const yesodStack = createModifierStack({
		id: chochmahCommand.args.stackId ?? `${chochmahCommand.id}.stack`,
		modifiers: tiferesModifiers
	});
	const malchusEvaluation = evaluateModifierStack(
		requireGeometry(malchusContext, binahSourceGeometryId),
		yesodStack,
		yesodNativeModifierRegistry,
		{
			...(chochmahCommand.args.context || {}),
			strict: chochmahCommand.args.strict !== false
		}
	);
	malchusContext.diagnostics.push(...malchusEvaluation.diagnostics);
	recordModifierTrace(
		malchusContext,
		chochmahCommand,
		binahSourceGeometryId,
		yesodStack.id,
		malchusEvaluation.trace
	);
	return storeGeometry(malchusContext, chochmahCommand, malchusEvaluation.artifact);
}

/**
 * Stores immutable modifier execution evidence inside compiler metadata without altering geometry semantics.
 * @param {object} malchusContext Mutable compiler context.
 * @param {object} chochmahCommand Executed command.
 * @param {string} binahSourceGeometryId Source geometry id.
 * @param {string} yesodStackId Modifier-stack id.
 * @param {Array<object>} tiferesTrace Ordered evaluator trace.
 * @returns {void}
 */
function recordModifierTrace(
	malchusContext,
	chochmahCommand,
	binahSourceGeometryId,
	yesodStackId,
	tiferesTrace
) {
	const gevurahPrevious = malchusContext.metadata.modifierExecutions ?? {};
	malchusContext.metadata.modifierExecutions = {
		...gevurahPrevious,
		[chochmahCommand.target]: Object.freeze({
			commandId: chochmahCommand.id,
			sourceGeometryId: binahSourceGeometryId,
			stackId: yesodStackId,
			trace: tiferesTrace
		})
	};
}
