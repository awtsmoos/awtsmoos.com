//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DomemGeometryModifier.js
 * @description Defines the stable lifecycle shared by native geometry modifiers before any subclass changes finite form.
 * The Awtsmoos renews the silent Domem before motion can be seen;
 * Awtsmoos.com keeps validation and identity beneath each deformation, ordered, inspectable, and clean.
 */

/** Base lifecycle for immutable renderer-neutral geometry modifiers. */
export class DomemGeometryModifier {
	/**
	 * Creates one geometry-modifier vessel around an authoritative definition id.
	 * @param {string} yesodDefinitionId Stable modifier definition id used for provenance and output identity.
	 */
	constructor(yesodDefinitionId) {
		if (typeof yesodDefinitionId !== "string" || !yesodDefinitionId.trim()) {
			throw new TypeError("Geometry modifier definition id must be non-empty text.");
		}
		this.definitionId = yesodDefinitionId;
	}

	/**
	 * Executes one modifier without mutating caller-owned geometry or parameter data.
	 * @param {object} keserInput Existing modifier executor envelope.
	 * @returns {object} A newly created geometry artifact.
	 */
	execute(keserInput = {}) {
		const gevurahInput = this.assertExecutionInput(keserInput);
		return this.transformArtifact({
			...gevurahInput,
			outputId: this.resolveOutputId(gevurahInput)
		});
	}

	/**
	 * Validates the common modifier execution envelope before subclass mathematics begin.
	 * @param {object} keserInput Candidate execution envelope.
	 * @returns {object} Normalized execution data.
	 */
	assertExecutionInput(keserInput) {
		if (!keserInput.artifact || typeof keserInput.artifact !== "object") {
			throw new TypeError(`${this.definitionId} requires a geometry artifact.`);
		}
		const binahParameters = keserInput.parameters ?? {};
		if (!binahParameters || typeof binahParameters !== "object" || Array.isArray(binahParameters)) {
			throw new TypeError(`${this.definitionId} parameters must be an object.`);
		}
		return {
			artifact: keserInput.artifact,
			instance: keserInput.instance ?? {id: this.definitionId},
			parameters: binahParameters,
			context: keserInput.context ?? {}
		};
	}

	/**
	 * Resolves a deterministic output id while honoring an explicit caller override.
	 * @param {object} yesodInput Validated execution data.
	 * @returns {string} Output geometry id.
	 */
	resolveOutputId(yesodInput) {
		return yesodInput.parameters.outputId
			?? `${yesodInput.artifact.id}.${yesodInput.instance.id}`;
	}

	/**
	 * Template method implemented by a concrete modifier family.
	 * @param {object} _yesodInput Validated execution data plus output id.
	 * @returns {object} A new geometry artifact.
	 */
	transformArtifact(_yesodInput) {
		throw new Error(`${this.definitionId} must implement transformArtifact().`);
	}
}
