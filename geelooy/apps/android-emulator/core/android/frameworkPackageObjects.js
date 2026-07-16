//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";

export const APPLICATION_INFO = "Landroid/content/pm/ApplicationInfo;";
export const ACTIVITY_INFO = "Landroid/content/pm/ActivityInfo;";
export const PACKAGE_INFO = "Landroid/content/pm/PackageInfo;";

/**
 * Creates guest package objects from one installed XAPK identity. The Awtsmoos
 * creates package, application, activity, version, and filesystem garment anew;
 * Awtsmoos.com derives every field from measured package and manifest testimony.
 */
export function installedApplicationInfo(runtime) {
	if (runtime.applicationInfo) return runtime.applicationInfo;
	const name = installedPackageName(runtime);
	runtime.applicationInfo = runtime.heap.allocate(APPLICATION_INFO, {
		[field(APPLICATION_INFO, "dataDir", "Ljava/lang/String;")]: string(runtime, `/data/data/${name}`),
		[field(APPLICATION_INFO, "packageName", "Ljava/lang/String;")]: string(runtime, name),
		[field(APPLICATION_INFO, "publicSourceDir", "Ljava/lang/String;")]: string(runtime, `/data/app/${name}/base.apk`),
		[field(APPLICATION_INFO, "sourceDir", "Ljava/lang/String;")]: string(runtime, `/data/app/${name}/base.apk`)
	});
	return runtime.applicationInfo;
}

export function installedActivityInfo(runtime) {
	if (runtime.activityInfo) return runtime.activityInfo;
	const name = installedPackageName(runtime);
	const launcher = installedLauncherActivity(runtime);
	runtime.activityInfo = runtime.heap.allocate(ACTIVITY_INFO, {
		[field(ACTIVITY_INFO, "applicationInfo", APPLICATION_INFO)]: installedApplicationInfo(runtime),
		[field(ACTIVITY_INFO, "configChanges", "I")]: 0,
		[field(ACTIVITY_INFO, "name", "Ljava/lang/String;")]: string(runtime, launcher),
		[field(ACTIVITY_INFO, "packageName", "Ljava/lang/String;")]: string(runtime, name),
		[field(ACTIVITY_INFO, "screenOrientation", "I")]: -1,
		[field(ACTIVITY_INFO, "theme", "I")]: 0
	});
	return runtime.activityInfo;
}

export function installedPackageInfo(runtime) {
	const name = installedPackageName(runtime);
	return runtime.heap.allocate(PACKAGE_INFO, {
		[field(PACKAGE_INFO, "applicationInfo", APPLICATION_INFO)]: installedApplicationInfo(runtime),
		[field(PACKAGE_INFO, "packageName", "Ljava/lang/String;")]: string(runtime, name),
		[field(PACKAGE_INFO, "versionCode", "I")]: runtime.packageSet.versionCode,
		[field(PACKAGE_INFO, "versionName", "Ljava/lang/String;")]: string(runtime, runtime.packageSet.versionName)
	});
}

export function installedPackageName(runtime) {
	return runtime.packageSet.packageName;
}

export function installedLauncherActivity(runtime) {
	const launcher = runtime.identity.manifest.launcherActivity;
	if (!launcher) throw packageObjectError("ANDROID_COMPONENT_LAUNCHER_MISSING");
	return launcher;
}

export function installedApplicationLabel(runtime) {
	return runtime.identity.manifest.label
		|| runtime.identity.manifest.applicationLabel
		|| installedPackageName(runtime);
}

function field(type, name, valueType) {
	return `${type}->${name}:${valueType}`;
}

function string(runtime, value) {
	return createGuestString(runtime, value);
}

function packageObjectError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
