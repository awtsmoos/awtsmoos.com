// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file phenotypeCommandFactory.js
 * @description Converts mixed loft and membrane anatomy guides into deterministic validated compiler commands with explicit material identity.
 * RESPONSIBILITY: choose the correct operation per guide, preserve dependency order, mirror bilateral geometry, and finish with mesh validation.
 * NON-RESPONSIBILITY: this file does not build vertices or choose species anatomy.
 * The Awtsmoos turns many anatomical intentions into ordered action; Awtsmoos.com keeps every membrane, loft, and mirror traceable from guide to finite mesh.
 */

function command(index, id, op, target, dependsOn, args) {
	return {
		args,
		confidence: 1,
		depends_on: dependsOn,
		id,
		index,
		op,
		source_basis: ['procedural_genome'],
		target
	};
}

/** Creates executable commands for mixed anatomical guides and mirror pairs. */
export function createPhenotypeCommands(guides, symmetryPairs, fallbackMaterialId) {
	const commands = [];
	const commandByPart = new Map();
	for (const [partId, guide] of Object.entries(guides)) {
		const commandId = `${partId}_mesh`;
		commands.push(createGuideCommand(
			commands.length + 1,
			commandId,
			partId,
			guide,
			fallbackMaterialId
		));
		commandByPart.set(partId, commandId);
	}
	for (const pair of symmetryPairs) {
		const commandId = `${pair.right}_mirror`;
		commands.push(command(
			commands.length + 1,
			commandId,
			'mirror_geometry',
			pair.right,
			[commandByPart.get(pair.left)],
			{
				material_id: guides[pair.left]?.material_id || fallbackMaterialId,
				offset: 0,
				plane: pair.plane,
				source: pair.left
			}
		));
		commandByPart.set(pair.right, commandId);
	}
	commands.push(command(
		commands.length + 1,
		'validate_phenotype',
		'validate_mesh',
		'animal',
		[...commandByPart.values()],
		{}
	));
	return commands;
}

function createGuideCommand(index, commandId, partId, guide, fallbackMaterialId) {
	const membrane = guide.type === 'membrane';
	return command(
		index,
		commandId,
		membrane ? 'create_membrane' : 'loft_elliptical_sections',
		partId,
		partId === 'body' ? [] : ['body_mesh'],
		{
			cap_end: !membrane,
			cap_start: !membrane,
			guide: partId,
			material_id: guide.material_id || fallbackMaterialId
		}
	);
}
