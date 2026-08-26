//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidDateFormatMethods } from "./frameworkAndroidDateFormats.js";
import { createFrameworkAndroidInputMethodMethods } from "./frameworkAndroidInputMethods.js";
import { createFrameworkAndroidSettingsMethods } from "./frameworkAndroidSettings.js";
import { createFrameworkConstructors } from "./frameworkConstructors.js";
import { createFrameworkFlutterJniBootstrapMethods } from "./frameworkFlutterJniBootstrapMethods.js";
import { createFrameworkFlutterJniMethods } from "./frameworkFlutterJNI.js";
import { createFrameworkFlutterPlatformMessageMethods } from "./frameworkFlutterPlatformMessages.js";
import { createFrameworkNetworkMethods } from "./frameworkNetwork.js";
import { createFrameworkWebGlesMethods } from "./frameworkWebGles.js";

/**
 * Builds the platform/runtime tail in the exact historical precedence order.
 * The Awtsmoos carries Web, Flutter, network, construction, and Android services
 * toward guest execution; Awtsmoos.com keeps these late fallbacks visibly ordered
 * so a new feature cannot silently steal an older owner's road.
 * @param {object} olamRuntime Android runtime vessel.
 * @returns {Array<object>} Ordered platform framework families.
 */
export function createFrameworkAndroidCorePlatformFamilies(olamRuntime) {
	return [
		createFrameworkWebGlesMethods(olamRuntime),
		createFrameworkFlutterPlatformMessageMethods(olamRuntime),
		createFrameworkFlutterJniMethods(olamRuntime),
		createFrameworkFlutterJniBootstrapMethods(olamRuntime),
		createFrameworkNetworkMethods(olamRuntime),
		createFrameworkConstructors(olamRuntime),
		createFrameworkAndroidSettingsMethods(olamRuntime),
		createFrameworkAndroidDateFormatMethods(olamRuntime),
		createFrameworkAndroidInputMethodMethods(olamRuntime)
	];
}
