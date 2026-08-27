// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	AnimalMeshSession,
	createAnimalMeshRecipe
} from "../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/index.js";
import {
	createAnimalThreeGroup
} from "../../../../libs/awtsmoos-procedural-core/src/adapters/three/animalMeshGroupFactory.js";

export class AnimalMeshRuntime {
	constructor(THREE, scene, options = {}) {
		if (!THREE || !scene) {
			throw new Error('B"H | AnimalMeshRuntime requires THREE and a scene.');
		}
		this.THREE = THREE;
		this.scene = scene;
		this.options = options;
		this.session = null;
		this.group = null;
	}

	loadRecipe(recipeInput) {
		const recipe = createAnimalMeshRecipe(recipeInput);
		this.session = new AnimalMeshSession(recipe, this.options.compilerOptions);
		return this.replaceGroup(this.session.artifact);
	}

	applyPatch(patch) {
		if (!this.session) {
			throw new Error('B"H | Load an animal recipe before applying a patch.');
		}
		const result = this.session.applyPatch(patch, this.options.compilerOptions);
		this.replaceGroup(result.artifact);
		return result;
	}

	replaceGroup(artifact) {
		if (this.group) {
			this.scene.remove(this.group);
			disposeGroup(this.group);
		}
		this.group = createAnimalThreeGroup(this.THREE, artifact, {
			name: artifact.recipe_id
		});
		this.scene.add(this.group);
		return {
			group: this.group,
			artifact,
			validationReport: artifact.validationReport
		};
	}

	dispose() {
		if (!this.group) {
			return;
		}
		this.scene.remove(this.group);
		disposeGroup(this.group);
		this.group = null;
		this.session = null;
	}
}

function disposeGroup(group) {
	group.traverse?.((object) => {
		object.geometry?.dispose?.();
		if (Array.isArray(object.material)) {
			object.material.forEach((material) => material.dispose?.());
		} else {
			object.material?.dispose?.();
		}
	});
}
