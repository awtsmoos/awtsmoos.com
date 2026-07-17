// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	proceduralObjectRecipeValidator
} from "../validation/ProceduralObjectRecipeValidator.js";
import {
	scheduleProceduralCommands
} from "./commandScheduler.js";
import {
	createArtifactFromContext
} from "./createArtifactFromContext.js";
import {
	clearCompilerTarget,
	createCompilerContext
} from "./createCompilerContext.js";
import {
	createDefaultProceduralOperationRegistry
} from "./createDefaultOperationRegistry.js";

/**
 * Compiles safe generic recipes into renderer-neutral procedural artifacts.
 */
export class ProceduralObjectCompiler {
	constructor(options = {}) {
		this.registry = options.registry
			|| createDefaultProceduralOperationRegistry(options.extensions);
		this.deferAdapterOperations = options.deferAdapterOperations !== false;
	}

	compile(recipe, options = {}) {
		proceduralObjectRecipeValidator.assertValid(recipe);
		const context = createCompilerContext(recipe, options);
		const commands = scheduleProceduralCommands(
			recipe.commands,
			options.commandIds
		);
		for (const rawCommand of commands) {
			const command = {
				...rawCommand,
				args: rawCommand.args || {}
			};
			clearCompilerTarget(context, command.target);
			this.executeCommand(context, command);
		}
		return createArtifactFromContext(context);
	}

	executeCommand(context, command) {
		const definition = this.registry.resolve(command.op);
		if (definition.executor === "core" && definition.handler) {
			return definition.handler(context, command);
		}
		if (!this.deferAdapterOperations) {
			throw new Error(`B"H | Operation requires adapter: ${command.op}`);
		}
		context.deferredCommands.push(Object.freeze({
			...command,
			executor: definition.executor
		}));
		return null;
	}
}

export const proceduralObjectCompiler = new ProceduralObjectCompiler();
