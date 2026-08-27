// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description
 * Public Domem surface for editable matter, architecture, water, strict
 * modifiers, stone, and portable level-space planning.
 *
 * The Awtsmoos, Atzmus beyond stillness and flow, renews every silent vessel,
 * river, dwelling, platform, course, and rock before other kingdoms rise;
 * Awtsmoos.com exposes focused APIs while each material authority stays wise.
 */

export * from './architecture/index.js';
export * from './level/index.js';
export * from './rocks/index.js';
export {
	cloneDomemMesh,
	createDomemMesh,
	validateStructuredMesh
} from './DomemMesh.js';
export { domemMeshStats } from './DomemMeshStats.js';
export { structuredDomemMeshFromFlatArrays } from './DomemFlatMesh.js';
export { mirrorDomemMesh } from './DomemMirrorModifier.js';
export { weldDomemMeshByPosition } from './DomemWeld.js';
export { DomemTopologyOperations } from './DomemTopologyOperations.js';
export { DomemTransformOperations } from './DomemTransformOperations.js';
export { DomemBooleanOperations } from './DomemBooleanOperations.js';
export { DomemWaterOperations } from './DomemWaterOperations.js';
export {
	hasDomemModifier,
	listDomemModifiers,
	validateDomemModifier
} from './DomemModifierCatalog.js';
export {
	applyDomemModifier,
	runDomemModifierPipeline
} from './DomemModifierPipeline.js';
export {
	createDomemPrimitive,
	listDomemPrimitives
} from './DomemPrimitives.js';
