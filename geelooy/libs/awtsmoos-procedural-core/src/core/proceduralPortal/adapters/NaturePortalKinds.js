//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NaturePortalKinds.js
 * @description Maps mature Nature operation names into stable semantic Portal namespaces without changing the underlying Nature vocabulary.
 * The Awtsmoos is one before kingdom and category, while finite editors need truthful grouping; Awtsmoos.com lets stone, plant, creature,
 * world, water, and resource operations enter namespaced semantic language through data alone rather than a central generator switch.
 */

const DOMEM_KINDS = new Set(['rock', 'rock-field', 'rock-morphology']);
const RESOURCE_KINDS = new Set(['material', 'surface', 'texture', 'surface-generation']);
const TZOMAYACH_KINDS = new Set([
	'plant', 'flowers', 'patch', 'moss', 'vine', 'vines', 'flora', 'grass', 'tree', 'forest'
]);
const CHAI_KINDS = new Set(['creature', 'fauna']);

/**
 * @description Converts one installed Nature operation into its stable canonical Portal semantic kind.
 * @param {string} natureKind Canonical Nature operation kind.
 * @returns {string} Namespaced Portal kind.
 */
export function portalKindForNatureOperation(natureKind) {
	const kind = String(natureKind).trim().toLowerCase();
	if (DOMEM_KINDS.has(kind)) return `domem.${kind}`;
	if (RESOURCE_KINDS.has(kind)) return `resource.${kind}`;
	if (TZOMAYACH_KINDS.has(kind)) return `tzomayach.${normalizePlantKind(kind)}`;
	if (CHAI_KINDS.has(kind)) return `chai.${kind}`;
	return `olam.${kind}`;
}

/**
 * @description Returns friendly aliases that preserve Nature's existing public vocabulary while adding singular ergonomic spellings.
 * @param {string} natureKind Canonical Nature operation kind.
 * @returns {readonly string[]} Frozen alias vocabulary.
 */
export function portalAliasesForNatureOperation(natureKind) {
	const kind = String(natureKind).trim().toLowerCase();
	const aliases = [kind];
	if (kind === 'flowers') aliases.push('flower', 'flower-cluster');
	if (kind === 'vines') aliases.push('vine-cluster');
	if (kind === 'fauna') aliases.push('animals');
	if (kind === 'water-body') aliases.push('waterbody');
	return Object.freeze([...new Set(aliases)]);
}

/**
 * @description Uses singular semantic names where the Nature operation name describes a generated collection rather than a type family.
 * @param {string} kind Nature plant-family operation kind.
 * @returns {string} Portal semantic suffix.
 */
function normalizePlantKind(kind) {
	if (kind === 'flowers') return 'flower-cluster';
	if (kind === 'vines') return 'vine-cluster';
	return kind;
}
