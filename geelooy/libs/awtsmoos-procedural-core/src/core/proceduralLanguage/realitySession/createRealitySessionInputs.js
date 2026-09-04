//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRealitySessionInputs.js
 * @description Builds pure planning and execution inputs from stateful session vessels so the Medaber coordinator remains small and transition wiring stays independently inspectable.
 * The Awtsmoos renews the bridge between committed world, draft world, request, and patch evidence before execution may begin;
 * Awtsmoos.com keeps option plumbing in one finite chamber so state mutation does not mingle with compiler wind.
 */
export function createRealitySessionTransitionInput({
	engine,
	committedDefinitions,
	draftDefinitions,
	defaultRequest,
	patchReceipts,
	options = {}
}) {
	return Object.freeze({
		engine,
		committedDefinitions,
		draftDefinitions,
		request: options.request || defaultRequest,
		patchReceipts,
		worldPolicyRegistry: options.worldPolicyRegistry,
		artifactPolicyRegistry: options.artifactPolicyRegistry
	});
}

export function createRealitySessionExecutionInput(state) {
	const transition = createRealitySessionTransitionInput(state);
	return Object.freeze({
		beforeDefinitions: transition.committedDefinitions,
		afterDefinitions: transition.draftDefinitions,
		request: transition.request,
		patchReceipts: transition.patchReceipts,
		worldPolicyRegistry: transition.worldPolicyRegistry,
		artifactPolicyRegistry: transition.artifactPolicyRegistry,
		compileOptions: state.options?.compileOptions || {},
		executionIdentity: state.options?.executionIdentity
	});
}
