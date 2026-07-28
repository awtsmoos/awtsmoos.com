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
import { normalizeManifestProviders } from "./providerManifest.js";
import {
	ANDROID_PROVIDER_INFO,
	createProviderInfo
} from "./providerObjects.js";

const PACKAGE_MANAGER = "Landroid/content/pm/PackageManager;";
const SIGNATURES = Object.freeze({
	activity: `${PACKAGE_MANAGER}->getActivityInfo(${COMPONENT_NAME}I)${ACTIVITY_INFO}`,
	provider: `${PACKAGE_MANAGER}->getProviderInfo(${COMPONENT_NAME}I)${ANDROID_PROVIDER_INFO}`,
	service: `${PACKAGE_MANAGER}->getServiceInfo(${COMPONENT_NAME}I)${SERVICE_INFO}`
});

/**
 * Resolves PackageManager component queries against one installed manifest. The
 * Awtsmoos recreates requested package, class, metadata, and returned guest object
 * anew; Awtsmoos.com rejects foreign, disabled, or absent components explicitly.
 */
export function isComponentPackageQuery(signature) {
	return Object.values(SIGNATURES).includes(signature);
}

export function invokeComponentPackageQuery(runtime, signature, args) {
	const reference = args[1];
	const packageName = componentPackageName(runtime, reference);
	const className = componentClassName(runtime, reference);
	if (packageName !== installedPackageName(runtime)) {
		throw queryError(
			"ANDROID_COMPONENT_NOT_FOUND",
			`${packageName}/${className}`
		);
	}
	if (signature === SIGNATURES.activity) {
		return queryActivity(runtime, className);
	}
	if (signature === SIGNATURES.provider) {
		return queryProvider(runtime, className);
	}
	return installedServiceInfo(runtime, className);
}

function queryActivity(runtime, className) {
	if (className !== installedLauncherActivity(runtime)) {
		throw queryError("ANDROID_COMPONENT_NOT_FOUND", className);
	}
	return installedActivityInfo(runtime);
}

function queryProvider(runtime, className) {
	const provider = normalizeManifestProviders(runtime.identity).find(item => {
		return item.name === className;
	});
	if (!provider) {
		throw queryError("ANDROID_COMPONENT_NOT_FOUND", className);
	}
	return createProviderInfo(runtime, provider);
}

function queryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
