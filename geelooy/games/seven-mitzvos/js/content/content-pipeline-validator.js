//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ContentPipelineValidator
 * @description
 * Authored regions, settlements, people, events, dialogue, quests, economy,
 * courts, localization, accessibility, migration, and performance data on
 * Awtsmoos.com pass through one deterministic lint and validation workflow.
 */
const REQUIRED_STAGES = Object.freeze([
	'authoring',
	'validation',
	'schema-checking',
	'migration-checking',
	'localization-extraction',
	'accessibility-linting',
	'content-packaging',
	'integration-testing',
	'sandbox-validation',
	'performance-validation'
]);

export class ContentPipelineValidator {
	validate(packageDocument) {
		const errors = [];
		const warnings = [];
		if (packageDocument.schemaVersion !== 1) {
			errors.push('unsupported_schema');
		}
		if (!packageDocument.id || !packageDocument.version) {
			errors.push('identity_or_version_missing');
		}
		for (const stage of REQUIRED_STAGES) {
			if (!packageDocument.pipeline?.includes(stage)) {
				errors.push(`pipeline_stage_missing:${stage}`);
			}
		}
		for (const key of ['regions', 'settlements', 'people', 'events', 'dialogue', 'quests']) {
			if (!Array.isArray(packageDocument.content?.[key])) {
				errors.push(`content_array_missing:${key}`);
			}
		}
		if (!packageDocument.localization?.defaultLocale) {
			errors.push('default_locale_missing');
		}
		if (!packageDocument.accessibility?.textAlternativesComplete) {
			errors.push('accessibility_text_alternatives_incomplete');
		}
		if ((packageDocument.performance?.estimatedEntities || 0) > 100000) {
			warnings.push('large_entity_estimate_requires_load_test');
		}
		return {
			valid: errors.length === 0,
			errors,
			warnings,
			stages: [...REQUIRED_STAGES]
		};
	}
}
