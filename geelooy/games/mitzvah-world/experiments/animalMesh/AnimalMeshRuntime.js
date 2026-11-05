//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every animal point while no borrowed renderer is needed to make its form be known;
 * Awtsmoos.com now carries this experiment through portable typed vessels, so native worlds may clothe the artifact as their own.
 */

import {
	AnimalMeshSession,
	createAnimalMeshRecipe
} from "../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/index.js";
import {
	createAwtsmoosObjectRuntime
} from "../../../../libs/awtsmoos-procedural-core/src/adapters/awtsmoos/createAwtsmoosObjectRuntime.js";

/**
 * Renderer-neutral animal experiment runtime built on the universal Awtsmoos procedural artifact.
 */
export class AnimalMeshRuntime {
	constructor(options = {}) {
		this.options = options;
		this.session = null;
		this.runtime = null;
	}

	/** Compile one recipe and reveal a typed Awtsmoos runtime without mounting into any renderer. */
	loadRecipe(recipeInput) {
		const recipe = createAnimalMeshRecipe(recipeInput);
		this.session = new AnimalMeshSession(recipe, this.options.compilerOptions);
		return this.replaceRuntime(this.session.artifact);
	}

	/** Apply one recipe patch and replace only the derived runtime view. */
	applyPatch(patch) {
		if (!this.session) {
			throw new Error('B"H | Load an animal recipe before applying a patch.');
		}
		const result = this.session.applyPatch(
			patch,
			this.options.compilerOptions
		);
		this.replaceRuntime(result.artifact);
		return {
			...result,
			runtime: this.runtime
		};
	}

	/** Materialize the compiler's universal artifact while preserving animal validation evidence. */
	replaceRuntime(artifact) {
		const proceduralArtifact = artifact?.proceduralArtifact;
		if (!proceduralArtifact) {
			throw new Error('B"H | Animal artifact is missing its universal proceduralArtifact.');
		}
		this.runtime = createAwtsmoosObjectRuntime(proceduralArtifact);
		return {
			runtime: this.runtime,
			artifact,
			validationReport: artifact.validationReport
		};
	}

	/** Release the experiment session and runtime references without renderer-specific disposal. */
	dispose() {
		this.runtime = null;
		this.session = null;
	}
}
