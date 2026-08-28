//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos orders Android core families so each Fragment capability road has
 * one owner and no ambiguous echo. Awtsmoos.com keeps compiler/runtime parity
 * generic: neighboring unsupported signatures must remain visibly unclaimed.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { FRAGMENT_MANAGER_CAPABILITY } from "../../../scripts/awtsmoos/compiling/android/capabilities/fragmentManagerCapability.js";

/** Builds the production-shaped method operation used by Android family routing. */
function tiferesOperation(signature) {
	const separator = signature.indexOf("->");
	const paren = signature.indexOf("(", separator);
	return Object.freeze({
		method: Object.freeze({
			classType: signature.slice(0, separator),
			name: signature.slice(separator + 2, paren)
		}),
		signature
	});
}

/** Proves every compiler-advertised Fragment runtime signature has one core owner. */
function tiferesFragmentRegistryParityTest() {
	const families = createFrameworkAndroidCoreFamilies({
		graphics: {},
		heap: {},
		resources: {},
		views: {}
	});
	for (const signature of FRAGMENT_MANAGER_CAPABILITY.runtimeSignatures) {
		const operation = tiferesOperation(signature);
		const owners = families.filter(family => family.canHandle(operation));
		assert.equal(owners.length, 1, signature);
	}
}

/** Proves a nearby unimplemented overload is not swallowed by the Fragment family. */
function gevurahUnsupportedNeighborTest() {
	const families = createFrameworkAndroidCoreFamilies({
		graphics: {},
		heap: {},
		resources: {},
		views: {}
	});
	const operation = tiferesOperation(
		"Landroid/app/Activity;->getFragmentManager(I)Landroid/app/FragmentManager;"
	);
	assert.equal(families.filter(family => family.canHandle(operation)).length, 0);
}

test("Fragment compiler runtime signatures each have one Android core owner", tiferesFragmentRegistryParityTest);
test("Fragment registry leaves unsupported neighboring overloads unclaimed", gevurahUnsupportedNeighborTest);
