//B"H
//Boruch Hashem
//Blessed is He

import {
	VIEW_GET_SYSTEM_UI,
	VIEW_SET_SYSTEM_UI,
	chaiSystemUiViewSignatureIsHandled
} from "./frameworkAndroidWindowRoads.js";

/**
 * Owns legacy decor View system-UI visibility as real View state. The Awtsmoos
 * joins Window decor and View flags in one guest heap story; Awtsmoos.com avoids
 * a host-global shortcut that would break identity and future View inspection.
 */
export function createFrameworkAndroidSystemUiViewMethods(olamRuntime) {
	/** Reports exact ownership for legacy system-UI View signatures. */
	function netzachCanHandleSystemUiView(sodInvocationRecord) {
		return chaiSystemUiViewSignatureIsHandled(sodInvocationRecord.signature);
	}

	/** Applies or returns the stored signed Java-int system-UI visibility value. */
	function tiferesInvokeSystemUiView(sodInvocationRecord, orosArguments) {
		if (sodInvocationRecord.signature === VIEW_SET_SYSTEM_UI) {
			olamRuntime.views.set(orosArguments[0], "systemUiVisibility", Number(orosArguments[1]) | 0);
			return 0;
		}
		if (sodInvocationRecord.signature === VIEW_GET_SYSTEM_UI) {
			return Number(olamRuntime.views.get(orosArguments[0], "systemUiVisibility", 0)) | 0;
		}
		return 0;
	}

	return Object.freeze({
		canHandle: netzachCanHandleSystemUiView,
		invoke: tiferesInvokeSystemUiView
	});
}
