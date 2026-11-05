//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialRoleInference.js
 * @description Resolves legacy material/object names to canonical manifest URLs or verified remote catalog candidates without inventing texture names.
 * The Awtsmoos knows every garment before role and word, while Awtsmoos.com lets old meshes seek a truthful remote ray;
 * where no legitimate catalog role exists, this module returns no disguise and leaves the surface hidden rather than leading sight astray.
 */

import { runtimeMaterialByRole } from './RuntimeMaterialManifest.js';
import { remoteMaterialCandidatesByTerms } from './RemoteMaterialCatalogCandidates.js';

const MANIFEST_RULES = Object.freeze([
	[/stream|river/i, 'water.stream'],
	[/lake|water|pond/i, 'water.lake'],
	[/marsh/i, 'terrain.marshGrass'],
	[/mud/i, 'terrain.mud'],
	[/sand|shore|beach/i, 'terrain.sandShore'],
	[/garden|herb|grass|meadow|ground|terrain/i, 'terrain.grass'],
	[/dirt|soil|earth/i, 'terrain.dirtMix'],
	[/horse/i, 'creature.horseFur'],
	[/bark|trunk/i, 'forest.bark'],
	[/wood|plank|timber/i, 'village.woodPlanks'],
	[/gate|arch|sanctuary|fieldstone/i, 'stone.fieldstone'],
	[/stone|rock|granite/i, 'stone.general'],
	[/roof|tile|shingle/i, 'roof.tile'],
	[/gold|halo|mote|light|flash|wave|fragment/i, 'metal.gold'],
	[/warden|iron|armor|weapon/i, 'metal.iron'],
	[/parchment|sign/i, 'sign.parchment'],
	[/mezuzah/i, 'mezuzah.case']
]);

const CATALOG_RULES = Object.freeze([
	[/cloth|fabric|robe|coat|shirt|pants|hat|garment/i, ['tan cloth']],
	[/leather|saddle|belt|boot|shoe/i, ['leather']],
	[/rope|cord|twine/i, ['raveled rope', 'unraveled rope']],
	[/glass|window|crystal/i, ['cracked glass']],
	[/silver/i, ['silver 1', 'silver 2']],
	[/copper/i, ['copper 1', 'copper 2']],
	[/fox/i, ['fox fur 1']],
	[/deer/i, ['deer fur 1']],
	[/cow/i, ['cow fur 1']],
	[/fur|hide|beast|demon|creature/i, ['deer fur 1', 'cow fur 1']],
	[/brick|masonry/i, ['weathered Red bricks 1', 'gray brick 1']]
]);

/** Resolves semantic role and ordered verified remote candidates for one material. */
export function inferRemoteMaterialIdentity(object, material = {}) {
	const explicitRole = material.texturePolicy?.semanticRole
		|| material.userData?.bootstrapMaterialRecord?.semanticRole
		|| object?.userData?.semanticMaterialRole
		|| null;
	const text = identityText(object, material, explicitRole);
	const role = explicitRole || inferredManifestRole(text);
	const manifest = role ? runtimeMaterialByRole(role) : null;
	const candidates = orderedUnique([
		material.textureUrl,
		manifest?.primaryUrl,
		...(manifest?.fallbackUrls || []),
		...catalogCandidates(text)
	]);
	return Object.freeze({
		candidates: Object.freeze(candidates),
		repeat: material.mapRepeat || manifest?.repeat || [1, 1],
		role
	});
}

function inferredManifestRole(text) {
	return MANIFEST_RULES.find(([matcher]) => matcher.test(text))?.[1] || null;
}

function catalogCandidates(text) {
	const rule = CATALOG_RULES.find(([matcher]) => matcher.test(text));
	return rule ? remoteMaterialCandidatesByTerms(rule[1], 4) : [];
}

function identityText(object, material, role) {
	return [role, object?.name, material?.name, material?.userData?.label]
		.filter(Boolean)
		.join(' ');
}

function orderedUnique(values) {
	return [...new Set(values.filter((value) => typeof value === 'string' && value.length))];
}
