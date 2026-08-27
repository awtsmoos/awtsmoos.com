// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export class AnimalMeshValidationResult {
	constructor() {
		this.errors = [];
		this.warnings = [];
	}

	addError(path, code, message) {
		this.errors.push({
			path,
			code,
			message
		});
	}

	addWarning(path, code, message) {
		this.warnings.push({
			path,
			code,
			message
		});
	}

	get valid() {
		return this.errors.length === 0;
	}

	toJSON() {
		return {
			valid: this.valid,
			errors: [
				...this.errors
			],
			warnings: [
				...this.warnings
			]
		};
	}
}
