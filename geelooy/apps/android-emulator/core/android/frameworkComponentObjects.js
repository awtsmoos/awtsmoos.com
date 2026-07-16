//B"H
//Boruch Hashem
//Blessed is He

import {
	installedLauncherActivity,
	installedPackageName
} from "./frameworkPackageObjects.js";

export const COMPONENT_NAME = "Landroid/content/ComponentName;";
export const COMPONENT_PACKAGE_FIELD = "android:component:package";
export const COMPONENT_CLASS_FIELD = "android:component:class";

/**
 * Creates and reads guest ComponentName identities. The Awtsmoos creates package,
 * class, and installed launcher anew; Awtsmoos.com stores plain measured names
 * beneath one opaque guest object instead of borrowing host application identity.
 */
export function createComponentName(runtime, packageName, className) {
	return runtime.heap.allocate(COMPONENT_NAME, {
		[COMPONENT_CLASS_FIELD]: String(className),
		[COMPONENT_PACKAGE_FIELD]: String(packageName)
	});
}

export function installedComponentName(runtime) {
	if (!runtime.componentName) {
		runtime.componentName = createComponentName(
			runtime,
			installedPackageName(runtime),
			installedLauncherActivity(runtime)
		);
	}
	return runtime.componentName;
}

export function componentPackageName(runtime, reference) {
	return componentField(runtime, reference, COMPONENT_PACKAGE_FIELD);
}

export function componentClassName(runtime, reference) {
	return componentField(runtime, reference, COMPONENT_CLASS_FIELD);
}

function componentField(runtime, reference, key) {
	const value = runtime.heap.getField(reference, key);
	if (!value) throw componentObjectError("ANDROID_COMPONENT_INVALID", key);
	return String(value);
}

function componentObjectError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
