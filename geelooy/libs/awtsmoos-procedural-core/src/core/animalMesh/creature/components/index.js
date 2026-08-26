// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Public discovery and composition surface for reusable creature anatomy, attachment, actions, coverings, hard growths, membranes, feathers, quality, materials, rigging, shading, and builder contracts.
 * RESPONSIBILITY: expose stable expert-facing concepts while private geometry/compiler helpers remain internal implementation details.
 * The Awtsmoos renews every organ through one source while forms remain many; Awtsmoos.com exposes a small data-first vocabulary so games, editors, docs, and AI tools can compose extraordinary creatures without importing private machinery by accident.
 */

export {
	AnatomicalAttachmentFrame,
	createAnatomicalAttachmentFrame
} from './AnatomicalAttachmentFrame.js';
export {
	AnatomicalComponent,
	createAnatomicalComponent
} from './AnatomicalComponent.js';
export {
	creatureAttachmentBinding,
	listCreatureAttachmentBindings
} from './CreatureAttachmentBindings.js';
export { createCreatureAttachmentComponents } from './CreatureAttachmentComponents.js';
export { CreatureAttachmentResolver } from './CreatureAttachmentResolver.js';
export {
	CreatureAttachmentSpec,
	createCreatureAttachmentSpec,
	listCreatureAttachmentModes
} from './CreatureAttachmentSpec.js';
export {
	CreatureComponentAction,
	createCreatureComponentAction,
	listCreatureComponentActionModes
} from './CreatureComponentAction.js';
export { createCreatureComponentActionIntent } from './CreatureComponentActionIntent.js';
export {
	CreatureComponentBuilder,
	createEmptyComponentResult
} from './CreatureComponentBuilder.js';
export { CreatureComponentCatalog } from './CreatureComponentCatalog.js';
export { CreatureComponentCompiler } from './CreatureComponentCompiler.js';
export {
	CreatureComponentComposer,
	composeCreatureComponents
} from './CreatureComponentComposer.js';
export {
	CreatureComponentDiscovery,
	describeCreatureComponents
} from './CreatureComponentDiscovery.js';
export {
	CreatureComponentProfile,
	createCreatureComponentProfile
} from './CreatureComponentProfile.js';
export { CreatureComponentResult } from './CreatureComponentResult.js';
export { creaturePhenotypeComponentMetadata } from './CreaturePhenotypeComponentMetadata.js';
export {
	CreatureRigExtensionIntent,
	createCreatureRigExtensionIntent
} from './CreatureRigExtensionIntent.js';
export {
	CreatureShadingPolicy,
	createCreatureShadingPolicy,
	listCreatureShadingModes
} from './CreatureShadingPolicy.js';
export { createCreatureSurfaceBlendPlan } from './CreatureSurfaceBlendPlan.js';
export { CoveringFrameBuilder } from './CoveringFrameBuilder.js';
export { createCoveringDistributionPlan } from './CoveringDistributionPlan.js';
export {
	CoveringLayerProfile,
	createCoveringLayerProfile,
	listCoveringLayerTypes
} from './CoveringLayerProfile.js';
export { FeatherFrameBuilder } from './FeatherFrameBuilder.js';
export {
	createFeatherLayerCatalog,
	createFeatherLayerProfile,
	listFeatherLayerIds
} from './FeatherLayerCatalog.js';
export {
	createFeatherProfile,
	listFeatherProfiles
} from './FeatherProfile.js';
export { KeratinFrameBuilder } from './KeratinFrameBuilder.js';
export {
	keratinProfile,
	listKeratinProfiles
} from './KeratinProfileCatalog.js';
export { MembraneFrameBuilder } from './MembraneFrameBuilder.js';
export {
	createMembraneComponentProfile,
	listMembraneComponentTypes
} from './MembraneComponentProfile.js';
export {
	creatureMirrorPair,
	rightSideCreatureId
} from './CreatureMirrorIds.js';
export {
	creatureQualityProfile,
	creatureQualitySegments
} from './CreatureQualityProfile.js';
export { creatureSpeciesAnatomy } from './CreatureSpeciesAnatomy.js';
export {
	creatureSurfaceMaterial,
	creatureSurfaceMaterials
} from './CreatureSurfaceRoles.js';
export { createHornComponent } from './HornComponent.js';
export { createFootComponents } from './FootComponent.js';
export { createWebbedFootMembrane } from './WebbedFootMembrane.js';
export { createFeatherComponent } from './FeatherComponent.js';
export { createFeatherFanComponent } from './FeatherFanComponent.js';
