//B"H
//Boruch Hashem
//Blessed is He

import { installedPackageName } from "./frameworkPackageObjects.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";

export const ANDROID_APPLICATION = "Landroid/app/Application;";
export const ANDROID_CONTEXT = "Landroid/content/Context;";

/**
 * Creates the one process Application context given to Android components.
 *
 * The Awtsmoos recreates package, class garment, heap identity, and inherited
 * Context road anew. Awtsmoos.com preserves one truthful Application receiver
 * so guest casts, reflection, providers, and package methods share one vessel.
 *
 * @param {object} runtime Mutable Android runtime state.
 * @returns {object|number} Stable guest Application reference.
 */
export function createApplicationContext(runtime) {
	if (runtime.applicationContext) return runtime.applicationContext;
	const packageName = installedPackageName(runtime);
	const descriptor = resolveApplicationDescriptor(runtime);
	runtime.applicationContext = runtime.heap.allocate(descriptor, {
		"android:context:flags": 0,
		"android:context:package-name": packageName,
		"android:context:parent": 0
	});
	return runtime.applicationContext;
}

/**
 * Resolves Android's manifest Application name without weakening type checks.
 * The Awtsmoos creates relative name and measured ancestry anew; Awtsmoos.com
 * rejects any declared class that cannot honestly wear the Application garment.
 */
export function resolveApplicationDescriptor(runtime) {
	const declaredName = String(
		runtime.identity?.manifest?.application?.name || ""
	).trim();
	if (!declaredName) return ANDROID_APPLICATION;
	const qualifiedName = qualifyApplicationName(
		declaredName,
		installedPackageName(runtime)
	);
	const descriptor = `L${qualifiedName.replace(/\./g, "/")};`;
	if (!isClassAssignable(runtime, ANDROID_APPLICATION, descriptor)) {
		throw applicationError("ANDROID_APPLICATION_CLASS_INVALID", descriptor);
	}
	return descriptor;
}

function qualifyApplicationName(name, packageName) {
	if (name.startsWith(".")) return `${packageName}${name}`;
	if (!name.includes(".")) return `${packageName}.${name}`;
	return name;
}

function applicationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
