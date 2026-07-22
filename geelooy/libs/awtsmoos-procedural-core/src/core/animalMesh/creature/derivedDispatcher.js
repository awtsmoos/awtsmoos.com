// B"H
// Boruch Hashem
// Blessed is He

import { refreshBriahCreature } from "./documents.js";
import { compileCreatureArtifacts } from "./artifactCompiler.js";
import { synthesizeYetzirahRig } from "./rigSynthesis.js";
import { dispatchRigDerived } from "./rigDerived.js";
import { dispatchSkinDerived } from "./skinDerived.js";
import { dispatchMotionDerived } from "./motionDerived.js";
import { dispatchMaterialDerived } from "./materialDerived.js";
import { dispatchCapabilityDerived } from "./capabilityDerived.js";
import { CreatureOperationError } from "./contracts.js";

function createContext(store, request) {
	const document = refreshBriahCreature(store.resolveDocument(request), false);
	const record = request.target?.artifactId
		? store.requireRecord(request.target.artifactId)
		: null;
	const previousRig = record?.compiled?.yetzirahRig
		|| record?.previousCompiled?.yetzirahRig
		|| null;
	return { document, record, previousRig };
}

function compileAndRemember(store, request) {
	const context = createContext(store, request);
	const compiled = compileCreatureArtifacts(context.document, {
		...request.arguments,
		previousRig: context.previousRig
	});
	if (context.record && !request.transactionId) {
		context.record.compiled = compiled;
		context.record.previousCompiled = null;
	}
	return compiled;
}

/** Resolves derived operations without allowing Asiyah to author Briah. */
export function dispatchDerivedOperation(store, request) {
	if (["creature.compile", "creature.export"].includes(request.operation)) {
		return compileAndRemember(store, request);
	}
	const context = createContext(store, request);
	const rig = synthesizeYetzirahRig(context.document, context.previousRig);
	for (const dispatcher of [
		dispatchRigDerived,
		dispatchSkinDerived,
		dispatchMotionDerived,
		dispatchMaterialDerived,
		dispatchCapabilityDerived
	]) {
		const result = dispatcher({
			store,
			request,
			document: context.document,
			rig,
			previousRig: context.previousRig
		});
		if (result !== undefined) return result;
	}
	throw new CreatureOperationError(
		"CREATURE_DERIVED_OPERATION_UNKNOWN",
		`Unsupported derived operation: ${request.operation}`
	);
}
