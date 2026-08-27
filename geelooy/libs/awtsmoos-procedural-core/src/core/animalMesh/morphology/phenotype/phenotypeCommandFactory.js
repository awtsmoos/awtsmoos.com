// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns anatomy into explicit machine operations. Every command
 * remains typed by the existing animal recipe schema, deterministic in order,
 * and executable by the established compiler without hidden scene mutation.
 */

function command(index, id, op, target, dependsOn, args) {
	return {
		index,
		id,
		op,
		target,
		depends_on: dependsOn,
		args,
		confidence: 1,
		source_basis: ["procedural_genome"]
	};
}

export function createPhenotypeCommands(guides, symmetryPairs, materialId) {
	const commands = [];
	const commandByPart = new Map();
	for (const partId of Object.keys(guides)) {
		const commandId = `${partId}_mesh`;
		const dependsOn = partId === "body" ? [] : ["body_mesh"];
		commands.push(command(
			commands.length + 1,
			commandId,
			"loft_elliptical_sections",
			partId,
			dependsOn,
			{
				guide: partId,
				cap_start: true,
				cap_end: true,
				material_id: materialId
			}
		));
		commandByPart.set(partId, commandId);
	}
	for (const pair of symmetryPairs) {
		const commandId = `${pair.right}_mirror`;
		commands.push(command(
			commands.length + 1,
			commandId,
			"mirror_geometry",
			pair.right,
			[commandByPart.get(pair.left)],
			{
				source: pair.left,
				plane: pair.plane,
				offset: 0,
				material_id: materialId
			}
		));
		commandByPart.set(pair.right, commandId);
	}
	commands.push(command(
		commands.length + 1,
		"validate_phenotype",
		"validate_mesh",
		"animal",
		[...commandByPart.values()],
		{}
	));
	return commands;
}
