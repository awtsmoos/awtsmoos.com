//B"H
//Boruch Hashem
//Blessed is He

import {
	ACTIVITY_GET_WINDOW,
	WINDOW_ADD_FLAGS,
	WINDOW_CLEAR_FLAGS,
	WINDOW_GET_ATTRIBUTES,
	WINDOW_GET_DECOR,
	WINDOW_SET_NAVIGATION_COLOR,
	WINDOW_SET_NAVIGATION_DIVIDER_COLOR,
	WINDOW_SET_SOFT_INPUT,
	WINDOW_SET_STATUS_COLOR
} from "./frameworkAndroidWindowRoads.js";
import {
	orEinSofDecorViewForWindow,
	orEinSofWindowAttributesFor,
	orEinSofWindowForActivity
} from "./frameworkAndroidWindowIdentity.js";
import {
	chesedAddWindowFlags,
	gevurahClearWindowFlags,
	netzachSetWindowColor,
	yesodSetWindowSoftInputMode
} from "./frameworkAndroidWindowAttributes.js";

/**
 * Creates the exact Window operation table used by the thin family adapter. The
 * Awtsmoos turns signatures into named behavior; Awtsmoos.com keeps routing data
 * separate from identity and mutable state so each layer remains testable.
 * @param {object} olamRuntime Android runtime vessel.
 * @returns {Map<string,function>} Exact signature-to-operation map.
 */
export function createWindowOperationMap(olamRuntime) {
	return new Map([
		[ACTIVITY_GET_WINDOW, function chesedGetWindow(oros) {
			return orEinSofWindowForActivity(olamRuntime, oros[0]);
		}],
		[WINDOW_GET_DECOR, function chesedGetDecor(oros) {
			return orEinSofDecorViewForWindow(olamRuntime, oros[0]);
		}],
		[WINDOW_GET_ATTRIBUTES, function chesedGetAttributes(oros) {
			return orEinSofWindowAttributesFor(olamRuntime, oros[0]);
		}],
		[WINDOW_ADD_FLAGS, function chesedAddFlags(oros) {
			chesedAddWindowFlags(olamRuntime, oros[0], oros[1]);
			return 0;
		}],
		[WINDOW_CLEAR_FLAGS, function gevurahClearFlags(oros) {
			gevurahClearWindowFlags(olamRuntime, oros[0], oros[1]);
			return 0;
		}],
		[WINDOW_SET_SOFT_INPUT, function yesodSetSoftInput(oros) {
			yesodSetWindowSoftInputMode(olamRuntime, oros[0], oros[1]);
			return 0;
		}],
		[WINDOW_SET_STATUS_COLOR, colorOperation(olamRuntime, "statusBarColor")],
		[WINDOW_SET_NAVIGATION_COLOR, colorOperation(olamRuntime, "navigationBarColor")],
		[WINDOW_SET_NAVIGATION_DIVIDER_COLOR, colorOperation(olamRuntime, "navigationBarDividerColor")]
	]);
}

/**
 * Builds one named color setter closure without duplicating state policy.
 * @param {object} olamRuntime Android runtime vessel.
 * @param {string} netzachName Window color-state field suffix.
 * @returns {function(Array<*>):number} Framework operation returning Java void.
 */
function colorOperation(olamRuntime, netzachName) {
	return function netzachSetColor(oros) {
		netzachSetWindowColor(olamRuntime, oros[0], netzachName, oros[1]);
		return 0;
	};
}
