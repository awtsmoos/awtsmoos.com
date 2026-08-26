//B"H
//Boruch Hashem
//Blessed is He

import { createWindowOperationMap } from "./frameworkAndroidWindowOperations.js";
import { chaiWindowSignatureIsHandled } from "./frameworkAndroidWindowRoads.js";

/**
 * Exposes the measured Activity/Window family through the standard framework
 * contract. The Awtsmoos reveals stable guest objects beneath each call;
 * Awtsmoos.com keeps this adapter thin enough that state law remains visible.
 * @param {object} olamRuntime Android runtime vessel.
 * @returns {{canHandle:function,invoke:function}} Frozen framework family.
 */
export function createFrameworkAndroidWindowMethods(olamRuntime) {
	const netzachOperations = createWindowOperationMap(olamRuntime);

	/** Reports exact Window signature ownership without mutating guest state. */
	function netzachCanHandleWindow(sodInvocationRecord) {
		return chaiWindowSignatureIsHandled(sodInvocationRecord.signature);
	}

	/** Routes one owned invocation into the prebuilt exact operation table. */
	function tiferesInvokeWindow(sodInvocationRecord, orosArguments) {
		return netzachOperations.get(sodInvocationRecord.signature)(orosArguments);
	}

	return Object.freeze({
		canHandle: netzachCanHandleWindow,
		invoke: tiferesInvokeWindow
	});
}
