//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos joins Android method names to small truthful services without
 * hiding policy inside a monolith. Awtsmoos.com lets this adapter remain thin:
 * exact signature data enters, measured guest-visible behavior leaves.
 */
import { chesedRegisterViewTreeListener, gevurahUnregisterViewTreeListener } from "./frameworkAndroidViewTreeObserverListeners.js";
import {
	CHAYA_VIEW_TREE_ALIVE_SIGNATURE,
	CHESED_VIEW_TREE_ADD,
	MALCHUS_VIEW_TREE_GET_SIGNATURE,
	chaiViewTreeObserverSignatureIsHandled,
	sodViewTreeListenerRoadFor
} from "./frameworkAndroidViewTreeObserverRoads.js";
import { chaiIsViewTreeObserverAlive, orEinSofViewTreeObserverFor } from "./frameworkAndroidViewTreeObserverState.js";

/**
 * Builds the exact Android ViewTreeObserver adapter over data-only signature
 * routes and small state/listener services. Public Android names stay stable;
 * internal orchestration stays modular and explicit.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @returns {{canHandle:function,invoke:function}} Frozen framework family.
 */
export function createFrameworkAndroidViewTreeObserverMethods(olamRuntime) {
	/**
	 * Reports exact signature ownership without touching guest state.
	 * @param {{signature:string}} sodInvocationRecord Framework invocation record.
	 * @returns {boolean} True when this family owns the method signature.
	 */
	function netzachCanHandleViewTreeObserver(sodInvocationRecord) {
		return chaiViewTreeObserverSignatureIsHandled(sodInvocationRecord.signature);
	}

	/**
	 * Routes one owned Android invocation into identity, liveness, registration,
	 * or removal behavior using only the data encoded by the signature roads.
	 * @param {{signature:string}} sodInvocationRecord Framework invocation record.
	 * @param {Array<*>} orosArguments Guest argument vector including receiver.
	 * @returns {*} Guest-visible framework result.
	 */
	function tiferesInvokeViewTreeObserver(sodInvocationRecord, orosArguments) {
		if (sodInvocationRecord.signature === MALCHUS_VIEW_TREE_GET_SIGNATURE) {
			return orEinSofViewTreeObserverFor(olamRuntime, orosArguments[0]);
		}
		if (sodInvocationRecord.signature === CHAYA_VIEW_TREE_ALIVE_SIGNATURE) {
			return chaiIsViewTreeObserverAlive(olamRuntime, orosArguments[0]);
		}
		const sodRoad = sodViewTreeListenerRoadFor(sodInvocationRecord.signature);
		const [gevurahAction, sefirahCategory] = sodRoad;
		if (gevurahAction === CHESED_VIEW_TREE_ADD) {
			return chesedRegisterViewTreeListener(olamRuntime, orosArguments[0], sefirahCategory, orosArguments[1]);
		}
		return gevurahUnregisterViewTreeListener(olamRuntime, orosArguments[0], sefirahCategory, orosArguments[1]);
	}

	return Object.freeze({
		canHandle: netzachCanHandleViewTreeObserver,
		invoke: tiferesInvokeViewTreeObserver
	});
}
