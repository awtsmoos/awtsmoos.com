//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ContentManifestValidator
 * @description
 * Creator packages on Awtsmoos.com declare identity, version, dependencies, locale, and data files before entering any world. The Awtsmoos gives boundless creativity; executable ambiguity remains outside the vessel.
 */
const FORBIDDEN_KEYS = Object.freeze([
	'script',
	'code',
	'eval',
	'function',
	'executable',
	'urlImport'
]);

export class ContentManifestValidator {
	/**
	 * @param {object} manifest Candidate content manifest.
	 * @param {object} installed Installed content versions.
	 * @returns {{valid: boolean, errors: string[]}} Validation result.
	 */
	validate(manifest, installed = {}) {
		const errors = [];
		if (!manifest || typeof manifest !== 'object') {
			return { valid: false, errors: ['manifest_must_be_object'] };
		}
		if (!manifest.id || !manifest.version || manifest.schemaVersion !== 1) {
			errors.push('identity_version_or_schema_missing');
		}
		const serialized = JSON.stringify(manifest).toLowerCase();
		for (const key of FORBIDDEN_KEYS) {
			if (serialized.includes(`"${key.toLowerCase()}"`)) {
				errors.push(`forbidden_executable_field:${key}`);
			}
		}
		for (const dependency of manifest.dependencies || []) {
			if (installed[dependency.id] !== dependency.version) {
				errors.push(`dependency_mismatch:${dependency.id}`);
			}
		}
		if (!Array.isArray(manifest.files) || manifest.files.some(file => !file.endsWith('.json'))) {
			errors.push('only_declarative_json_files_allowed');
		}
		return { valid: errors.length === 0, errors };
	}
}
