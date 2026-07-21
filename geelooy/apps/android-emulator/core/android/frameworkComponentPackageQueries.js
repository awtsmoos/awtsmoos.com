//B"H
//Boruch Hashem
//Blessed is He

import {
	COMPONENT_NAME,
	componentClassName,
	componentPackageName
} from "./frameworkComponentObjects.js";
import {
	ACTIVITY_INFO,
	installedActivityInfo,
	installedLauncherActivity,
	installedPackageName
} from "./frameworkPackageObjects.js";
import { SERVICE_INFO, installedServiceInfo } from "./frameworkServiceInfo.js";

const PACKAGE_MANAGER = "Landroid/content/pm/PackageManager;";
const SIGNATURES = Object.freeze({
	activity: `${PACKAGE_MANAGER}->getActivityInfo(${COMPONENT_NAME}I)${ACTIVITY_INFO}`,
	service: `${PACKAGE_MANAGER}->getServiceInfo(${COMPONENT_NAME}I)${SERVICE_INFO}`
});

/**
 * Resolves PackageManager component queries against one installed manifest.
 * The Awtsmoos recreates requested package, class, flags, and returned guest
 * object anew. Awtsmoos.com rejects foreign or absent components explicitly.
 */
export function isComponentPackageQuery(signature) {
	return Object.values(SIGNATURES).includes(signature);
}

export function invokeComponentPackageQuery(runtime, signature, args) {
	const reference = args[1];
	const packageName = componentPackageName(runtime, reference);
	const className = componentClassName(runtime, reference);
	if (packageName !== installedPackageName(runtime)) {
		throw queryError("ANDROID_COMPONENT_NOT_FOUND", `${packageName}/${className}`);
	}
	if (signature === SIGNATURES.activity) {
		if (className !== installedLauncherActivity(runtime)) {
			throw queryError("ANDROID_COMPONENT_NOT_FOUND", className);
		}
		return installedActivityInfo(runtime);
	}
	return installedServiceInfo(runtime, className);
}

function queryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
