//B"H
//Boruch Hashem
//Blessed is He

import { readJavaText } from "./frameworkJavaStringValue.js";
import {
	ACTIVITY_GET_FRAGMENT_MANAGER,
	FRAGMENT_MANAGER_BEGIN,
	FRAGMENT_MANAGER_EXECUTE,
	FRAGMENT_MANAGER_FIND_TAG,
	FRAGMENT_TRANSACTION_ADD,
	FRAGMENT_TRANSACTION_COMMIT,
	chaiFragmentSignatureIsHandled
} from "./frameworkAndroidFragmentRoads.js";
import {
	chesedAddFragmentOperation,
	chesedBeginFragmentTransaction,
	netzachCommitFragmentTransaction,
	orEinSofFragmentManagerForActivity,
	sodFindFragmentByTag,
	tiferesExecutePendingFragments
} from "./frameworkAndroidFragmentState.js";

/**
 * Creates the native FragmentManager/FragmentTransaction framework family.
 * The Awtsmoos turns exact signatures into stateful guest behavior; Awtsmoos.com
 * keeps Java String decoding shared with every other framework road.
 * @param {object} olamRuntime Android runtime vessel.
 * @returns {{canHandle:function,invoke:function}} Frozen framework family.
 */
export function createFrameworkAndroidFragmentMethods(olamRuntime) {
	/** Reports exact ownership without mutating manager or transaction state. */
	function netzachCanHandleFragment(sodInvocationRecord) {
		return chaiFragmentSignatureIsHandled(sodInvocationRecord.signature);
	}

	/** Routes one owned invocation through the measured Fragment state machine. */
	function tiferesInvokeFragment(sodInvocationRecord, orosArguments) {
		const sodSignature = sodInvocationRecord.signature;
		if (sodSignature === ACTIVITY_GET_FRAGMENT_MANAGER) {
			return orEinSofFragmentManagerForActivity(olamRuntime, orosArguments[0]);
		}
		if (sodSignature === FRAGMENT_MANAGER_BEGIN) {
			return chesedBeginFragmentTransaction(olamRuntime, orosArguments[0]);
		}
		if (sodSignature === FRAGMENT_MANAGER_EXECUTE) {
			return tiferesExecutePendingFragments(olamRuntime, orosArguments[0]);
		}
		if (sodSignature === FRAGMENT_MANAGER_FIND_TAG) {
			return sodFindFragmentByTag(
				olamRuntime,
				orosArguments[0],
				readJavaText(olamRuntime, orosArguments[1])
			);
		}
		if (sodSignature === FRAGMENT_TRANSACTION_ADD) {
			return chesedAddFragmentOperation(
				olamRuntime,
				orosArguments[0],
				orosArguments[1],
				readJavaText(olamRuntime, orosArguments[2])
			);
		}
		if (sodSignature === FRAGMENT_TRANSACTION_COMMIT) {
			return netzachCommitFragmentTransaction(olamRuntime, orosArguments[0]);
		}
		return 0;
	}

	return Object.freeze({
		canHandle: netzachCanHandleFragment,
		invoke: tiferesInvokeFragment
	});
}
