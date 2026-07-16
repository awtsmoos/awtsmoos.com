// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	assignAutomaticBoneWeights
} from "../rig/automaticWeights.js";
import {
	buildAnimalRig
} from "../rig/rigBuilder.js";
import {
	animalMeshRecipeValidator
} from "../validation/AnimalMeshRecipeValidator.js";
import {
	createAnimalMeshValidationReport
} from "../validation/meshReport.js";
import {
	scheduleAnimalMeshCommands
} from "./commandScheduler.js";
import {
	createDefaultAnimalMeshOperationRegistry
} from "./createDefaultOperationRegistry.js";

export class AnimalMeshCompiler {
	constructor(options = {}) {
		this.registry = options.registry || createDefaultAnimalMeshOperationRegistry();
		this.deferAdapterOperations = options.deferAdapterOperations !== false;
	}

	compile(recipe, options = {}) {
		animalMeshRecipeValidator.assertValid(recipe);
		const rig = buildAnimalRig(recipe.rig);
		const context = {
			recipe,
			parts: new Map(),
			deferredCommands: [],
			diagnostics: []
		};
		this.seedPreviousParts(context, options.previousArtifact, options.commandIds);
		const commands = scheduleAnimalMeshCommands(recipe.commands, options.commandIds);

		for (const command of commands) {
			context.parts.delete(command.target);
			this.executeCommand(context, command);
		}
		const parts = Array.from(context.parts.values())
			.map((part) => options.generateWeights === false
				? part
				: assignAutomaticBoneWeights(part, rig));
		const artifact = {
			schema: "awtsmoos.animal-mesh-artifact",
			schema_version: recipe.schema_version,
			recipe_id: recipe.recipe_id,
			parts,
			materials: [
				...recipe.materials
			],
			rig,
			deferredCommands: context.deferredCommands,
			diagnostics: context.diagnostics,
			commandIds: recipe.commands.map((command) => command.id)
		};
		artifact.validationReport = createAnimalMeshValidationReport(artifact, recipe);
		return artifact;
	}

	seedPreviousParts(context, previousArtifact, commandIds) {
		if (!previousArtifact) {
			return;
		}
		const changedTargets = new Set(
			context.recipe.commands
				.filter((command) => commandIds?.includes(command.id))
				.map((command) => command.target)
		);
		for (const part of previousArtifact.parts || []) {
			if (!changedTargets.has(part.id)) {
				context.parts.set(part.id, {
					...part
				});
			}
		}
	}

	executeCommand(context, command) {
		const definition = this.registry.resolve(command.op);
		if (definition.executor === "core" && definition.handler) {
			definition.handler(context, command);
			return;
		}
		if (!this.deferAdapterOperations) {
			throw new Error(`B"H | Operation requires an adapter: ${command.op}`);
		}
		context.deferredCommands.push({
			...command,
			executor: definition.executor
		});
	}
}

export const animalMeshCompiler = new AnimalMeshCompiler();
