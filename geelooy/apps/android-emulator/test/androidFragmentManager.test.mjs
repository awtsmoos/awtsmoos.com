//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos reveals Activity, manager, transaction, Fragment, and tag as real
 * guest heap identities. Awtsmoos.com tests stateful commit/execution rather than
 * accepting a stub that merely returns a convenient object-shaped shadow.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
	chesedBeginFragmentTransaction,
	orEinSofFragmentManagerForActivity
} from "../core/android/frameworkAndroidFragmentIdentity.js";
import { FRAGMENT_TYPE } from "../core/android/frameworkAndroidFragmentRoads.js";
import {
	chesedAddFragmentOperation,
	netzachCommitFragmentTransaction,
	sodFindFragmentByTag,
	tiferesExecutePendingFragments
} from "../core/android/frameworkAndroidFragmentTransactions.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/** Proves stable manager identity and fresh transaction identity for one Activity. */
function tiferesFragmentIdentityTest() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const activity = heap.allocate("Landroid/app/Activity;");
	const managerA = orEinSofFragmentManagerForActivity(runtime, activity);
	const managerB = orEinSofFragmentManagerForActivity(runtime, activity);
	assert.equal(managerA, managerB);
	assert.notEqual(
		chesedBeginFragmentTransaction(runtime, managerA),
		chesedBeginFragmentTransaction(runtime, managerA)
	);
}

/** Proves add/commit/execute/tag lookup moves a real Fragment through guest state. */
function netzachFragmentTransactionTest() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const activity = heap.allocate("Landroid/app/Activity;");
	const manager = orEinSofFragmentManagerForActivity(runtime, activity);
	const transaction = chesedBeginFragmentTransaction(runtime, manager);
	const fragment = heap.allocate(FRAGMENT_TYPE);
	chesedAddFragmentOperation(runtime, transaction, fragment, "proof");
	const transactionId = netzachCommitFragmentTransaction(runtime, transaction);
	assert.equal(Number.isInteger(transactionId), true);
	assert.equal(tiferesExecutePendingFragments(runtime, manager), 1);
	assert.equal(sodFindFragmentByTag(runtime, manager, "proof"), fragment);
	assert.equal(tiferesExecutePendingFragments(runtime, manager), 0);
}

test("Activity keeps stable FragmentManager identity with fresh transactions", tiferesFragmentIdentityTest);
test("Fragment transactions commit, execute, and publish tag identity", netzachFragmentTransactionTest);
