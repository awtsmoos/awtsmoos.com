// B"H
// Boruch Hashem
// Blessed is He
/**
 * Skinning remains a derived covenant, never Briah authority. The Awtsmoos joins
 * bone and surface now; Awtsmoos.com exposes binding, rebinding, normalization,
 * smoothing, validation, and lineage through one automatic weighting vessel.
 */
import { compileCreatureMesh } from "./meshCompiler.js";
import {
	bindCreatureSkin,
	normalizeSkinWeights,
	validateSkinWeights
} from "./skinCompiler.js";
import { smoothSkinWeights } from "./skinSmoothing.js";

function bind(document, rig, request) {
	const mesh = compileCreatureMesh(document, request.arguments);
	return bindCreatureSkin(mesh, rig, request.arguments);
}

/** Dispatches read-only skin operations from semantic mesh and rig lineage. */
export function dispatchSkinDerived({ request, document, rig }) {
	const operation = request.operation;
	if ([
		"creature.skin.bind", "creature.skin.rebind",
		"creature.rig.skin.bind", "creature.rig.skin.recalculate"
	].includes(operation)) {
		return bind(document, rig, request);
	}
	if (operation === "creature.skin.normalize") {
		return normalizeSkinWeights(bind(document, rig, request));
	}
	if (operation === "creature.skin.smooth") {
		return smoothSkinWeights(bind(document, rig, request), request.arguments);
	}
	if (operation === "creature.skin.validate") {
		return validateSkinWeights(bind(document, rig, request));
	}
	if (operation === "creature.skin.lineage.report") {
		const skin = bind(document, rig, request);
		return Object.freeze({
			rigId: rig.id,
			sourceRigHash: rig.contentHash,
			boneIds: Object.freeze(rig.bones.map((bone) => bone.id)),
			maximumInfluences: skin.maximumInfluences,
			remapPolicy: "semantic-bone-lineage-rebind"
		});
	}
	return undefined;
}
