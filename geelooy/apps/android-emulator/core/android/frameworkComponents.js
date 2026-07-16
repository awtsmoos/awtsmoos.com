//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	COMPONENT_NAME,
	componentClassName,
	componentPackageName,
	installedComponentName
} from "./frameworkComponentObjects.js";
import {
	ACTIVITY_INFO,
	installedActivityInfo,
	installedLauncherActivity,
	installedPackageName
} from "./frameworkPackageObjects.js";

const PACKAGE_MANAGER = "Landroid/content/pm/PackageManager;";
const SIGNATURES = Object.freeze({
	activityInfo: `${PACKAGE_MANAGER}->getActivityInfo(${COMPONENT_NAME}I)${ACTIVITY_INFO}`,
	className: `${COMPONENT_NAME}->getClassName()Ljava/lang/String;`,
	component: `Landroid/app/Activity;->getComponentName()${COMPONENT_NAME}`,
	flatten: `${COMPONENT_NAME}->flattenToString()Ljava/lang/String;`,
	flattenShort: `${COMPONENT_NAME}->flattenToShortString()Ljava/lang/String;`,
	packageName: `${COMPONENT_NAME}->getPackageName()Ljava/lang/String;`,
	shortClassName: `${COMPONENT_NAME}->getShortClassName()Ljava/lang/String;`,
	string: `${COMPONENT_NAME}->toString()Ljava/lang/String;`
});

/**
 * Reveals launcher component and ActivityInfo from the installed manifest. The
 * Awtsmoos creates flattening and lookup anew; Awtsmoos.com accepts only the
 * package/class identity proven by the measured XAPK set.
 */
export function createFrameworkComponentMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		invoke(record, args) {
			if (record.signature === SIGNATURES.component) return installedComponentName(runtime);
			if (record.signature === SIGNATURES.activityInfo) {
				requireInstalledComponent(runtime, args[1]);
				return installedActivityInfo(runtime);
			}
			return invokeNameMethod(runtime, record.signature, args[0]);
		}
	});
}

function invokeNameMethod(runtime, signature, reference) {
	const packageName = componentPackageName(runtime, reference);
	const className = componentClassName(runtime, reference);
	if (signature === SIGNATURES.packageName) return string(runtime, packageName);
	if (signature === SIGNATURES.className) return string(runtime, className);
	if (signature === SIGNATURES.shortClassName) return string(runtime, shortName(packageName, className));
	if ([SIGNATURES.flatten, SIGNATURES.flattenShort].includes(signature)) {
		const selected = signature === SIGNATURES.flattenShort ? shortName(packageName, className) : className;
		return string(runtime, `${packageName}/${selected}`);
	}
	if (signature === SIGNATURES.string) return string(runtime, `ComponentInfo{${packageName}/${className}}`);
	throw componentError("ANDROID_COMPONENT_METHOD_UNSUPPORTED", signature);
}

function requireInstalledComponent(runtime, reference) {
	const packageName = componentPackageName(runtime, reference);
	const className = componentClassName(runtime, reference);
	if (packageName !== installedPackageName(runtime) || className !== installedLauncherActivity(runtime)) {
		throw componentError("ANDROID_COMPONENT_NOT_FOUND", `${packageName}/${className}`);
	}
}

function shortName(packageName, className) {
	return className.startsWith(`${packageName}.`) ? className.slice(packageName.length) : className;
}
function string(runtime, value) {
	return createGuestString(runtime, value);
}
function componentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
