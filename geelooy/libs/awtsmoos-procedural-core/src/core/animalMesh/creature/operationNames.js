// B"H
// Boruch Hashem
// Blessed is He
/** One exact vocabulary keeps semantic edits and derived worlds in one kernel. */

export const TRANSACTION_OPERATIONS = Object.freeze([
	"transaction.begin", "transaction.stage", "transaction.preview",
	"transaction.validate", "transaction.commit", "transaction.rollback"
]);
export const DOCUMENT_OPERATIONS = Object.freeze([
	"creature.create", "creature.inspect", "creature.validate",
	"creature.compare", "creature.clone", "creature.branch",
	"creature.replay", "creature.undo", "creature.redo",
	"creature.operation.list", "creature.operation.inspect",
	"creature.compile", "creature.export"
]);
export const BODY_MUTATIONS = Object.freeze([
	"creature.body.create", "creature.body.section.insert",
	"creature.body.section.remove", "creature.body.section.move",
	"creature.body.section.scale", "creature.body.section.rotate",
	"creature.body.region.bend", "creature.body.region.taper",
	"creature.body.region.stretch", "creature.body.resample"
]);
export const LIMB_MUTATIONS = Object.freeze([
	"creature.limb.create", "creature.limb.createPair",
	"creature.limb.joint.insert", "creature.limb.joint.remove",
	"creature.limb.joint.move", "creature.limb.segment.length.set",
	"creature.limb.segment.radius.set", "creature.limb.role.set",
	"creature.limb.endpoint.attach", "creature.limb.branch"
]);
export const PART_MUTATIONS = Object.freeze([
	"creature.part.attach", "creature.part.remove", "creature.part.detach",
	"creature.part.clone", "creature.part.move", "creature.part.rotate",
	"creature.part.scale", "creature.part.parameter.set",
	"creature.part.reparent", "creature.part.stack", "creature.part.snap"
]);
export const SYMMETRY_MUTATIONS = Object.freeze([
	"creature.symmetry.create", "creature.symmetry.link",
	"creature.symmetry.break", "creature.symmetry.restore",
	"creature.symmetry.property.link", "creature.symmetry.property.unlink",
	"creature.symmetry.variation.apply"
]);
export const MATERIAL_MUTATIONS = Object.freeze([
	"creature.material.layer.add", "creature.material.layer.remove",
	"creature.material.layer.reorder", "creature.material.layer.pattern.set",
	"creature.material.layer.palette.set", "creature.material.layer.mask.set",
	"creature.material.region.override"
]);
export const RIG_MUTATIONS = Object.freeze(["creature.rig.constraint.set"]);
export const CREATURE_MUTATION_OPERATIONS = Object.freeze([
	...BODY_MUTATIONS, ...LIMB_MUTATIONS, ...PART_MUTATIONS,
	...SYMMETRY_MUTATIONS, ...MATERIAL_MUTATIONS, ...RIG_MUTATIONS
]);
export const DERIVED_OPERATIONS = Object.freeze([
	"creature.rig.synthesize", "creature.rig.rebuild",
	"creature.rig.inspect", "creature.rig.validate",
	"creature.rig.compare", "creature.rig.pose.evaluate",
	"creature.rig.contactTargets.derive", "creature.rig.skin.bind",
	"creature.rig.skin.recalculate", "creature.rig.lineage.report",
	"creature.skin.bind", "creature.skin.rebind",
	"creature.skin.normalize", "creature.skin.smooth",
	"creature.skin.validate", "creature.skin.lineage.report",
	"creature.motion.analyzeBodyPlan", "creature.motion.planLocomotion",
	"creature.motion.evaluate", "creature.motion.secondary.evaluate",
	"creature.motion.explain", "creature.motion.retarget",
	"creature.motion.testAction", "creature.expression.evaluate",
	"creature.material.compile", "creature.material.bake",
	"creature.capability.evaluate", "creature.capabilities.evaluate",
	"creature.capabilities.explain", "creature.budget.estimate",
	"creature.budget.validate", "creature.budget.optimize",
	"creature.body.validate", "creature.limb.validate",
	"creature.part.validate", "creature.symmetry.validate"
]);
export const CREATURE_OPERATION_NAMES = Object.freeze([
	...DOCUMENT_OPERATIONS, ...TRANSACTION_OPERATIONS,
	...CREATURE_MUTATION_OPERATIONS, ...DERIVED_OPERATIONS
]);
