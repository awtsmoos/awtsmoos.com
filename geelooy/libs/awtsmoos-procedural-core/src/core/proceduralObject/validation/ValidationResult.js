// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

export class ValidationResult {
	constructor() {
		this.errors = [];
		this.warnings = [];
	}

	addError(path, message) {
		this.errors.push({
			path,
			message
		});
		return this;
	}

	addWarning(path, message) {
		this.warnings.push({
			path,
			message
		});
		return this;
	}

	get valid() {
		return this.errors.length === 0;
	}

	assertValid() {
		if (!this.valid) {
			const summary = this.errors
				.map((error) => `${error.path}: ${error.message}`)
				.join("; ");
			throw new Error(`B"H | Invalid procedural object recipe: ${summary}`);
		}
		return this;
	}
}
