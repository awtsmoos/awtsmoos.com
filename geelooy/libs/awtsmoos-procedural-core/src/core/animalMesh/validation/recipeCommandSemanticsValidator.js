// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file recipeCommandSemanticsValidator.js
 * @description Validates cross-reference semantics for guide, mirror, join, and dependency operations in animal recipes.
 * RESPONSIBILITY: ensure commands reference existing guides/sources in deterministic prior-command order.
 * NON-RESPONSIBILITY: this validator does not execute geometry or judge biological realism.
 * The Awtsmoos joins command to source before any polygon appears; Awtsmoos.com keeps every guide relationship explicit so richer anatomy cannot hide broken lineage.
 */

const GUIDE_OPERATIONS = new Set([
	'create_membrane',
	'loft_elliptical_sections',
	'loft_profile_sections'
]);

export function validateCommandSemantics(recipe, result) {
	const references = new Set(
		(recipe.references || []).map(reference => reference.reference_id)
	);
	const commandIndexById = new Map(
		(recipe.commands || []).map(command => [command.id, command.index])
	);
	(recipe.commands || []).forEach((command, index) => {
		validateOneCommand(
			command,
			index,
			recipe,
			result,
			references,
			commandIndexById
		);
	});
}

function validateOneCommand(
	command,
	index,
	recipe,
	result,
	references,
	commandIndexById
) {
	const path = `/commands/${index}`;
	for (const sourceId of command.source_basis || []) {
		if (!references.has(sourceId)) {
			result.addError(
				`${path}/source_basis`,
				'source_reference',
				`Unknown reference id: ${sourceId}`
			);
		}
	}
	for (const dependencyId of command.depends_on || []) {
		if ((commandIndexById.get(dependencyId) || Infinity) >= command.index) {
			result.addError(
				`${path}/depends_on`,
				'dependency_order',
				'Dependencies must appear before the command.'
			);
		}
	}
	validateGuideReference(command, path, recipe, result);
	validateAssemblyReference(command, path, result);
}

function validateGuideReference(command, path, recipe, result) {
	if (!GUIDE_OPERATIONS.has(command.op)) {
		return;
	}
	if (recipe.anatomical_guides?.[command.args?.guide]) {
		return;
	}
	result.addError(
		`${path}/args/guide`,
		'guide_reference',
		'Geometry command must reference an existing guide.'
	);
}

function validateAssemblyReference(command, path, result) {
	if (command.op === 'mirror_geometry' && !command.args?.source) {
		result.addError(
			`${path}/args/source`,
			'mirror_source',
			'Mirror operation requires a source part.'
		);
	}
	if (
		command.op === 'join_meshes'
		&& (!Array.isArray(command.args?.sources) || command.args.sources.length < 1)
	) {
		result.addError(
			`${path}/args/sources`,
			'join_sources',
			'Join operation requires source part ids.'
		);
	}
}
