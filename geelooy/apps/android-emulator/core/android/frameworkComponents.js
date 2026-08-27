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
	invokeComponentConstructor,
	isComponentConstructor
} from "./frameworkComponentConstructors.js";
import {
	invokeComponentPackageQuery,
	isComponentPackageQuery
} from "./frameworkComponentPackageQueries.js";

const SIGNATURES = Object.freeze({
	className: `${COMPONENT_NAME}->getClassName()Ljava/lang/String;`,
	component: `Landroid/app/Activity;->getComponentName()${COMPONENT_NAME}`,
	flatten: `${COMPONENT_NAME}->flattenToString()Ljava/lang/String;`,
	flattenShort: `${COMPONENT_NAME}->flattenToShortString()Ljava/lang/String;`,
	packageName: `${COMPONENT_NAME}->getPackageName()Ljava/lang/String;`,
	shortClassName: `${COMPONENT_NAME}->getShortClassName()Ljava/lang/String;`,
	string: `${COMPONENT_NAME}->toString()Ljava/lang/String;`
});

/**
 * Reveals and constructs ComponentName identity from installed guest testimony.
 * The Awtsmoos recreates package, class, lookup, and flattening anew while
 * Awtsmoos.com delegates manifest queries to their own bounded capability.
 */
export function createFrameworkComponentMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isComponentConstructor(record.signature)
				|| isComponentPackageQuery(record.signature)
				|| Object.values(SIGNATURES).includes(record.signature);
		},
		invoke(record, args) {
			const signature = record.signature;
			if (isComponentConstructor(signature)) {
				return invokeComponentConstructor(runtime, signature, args);
			}
			if (isComponentPackageQuery(signature)) {
				return invokeComponentPackageQuery(runtime, signature, args);
			}
			if (signature === SIGNATURES.component) {
				return installedComponentName(runtime);
			}
			return invokeNameMethod(runtime, signature, args[0]);
		}
	});
}

function invokeNameMethod(runtime, signature, reference) {
	const packageName = componentPackageName(runtime, reference);
	const className = componentClassName(runtime, reference);
	if (signature === SIGNATURES.packageName) return string(runtime, packageName);
	if (signature === SIGNATURES.className) return string(runtime, className);
	if (signature === SIGNATURES.shortClassName) {
		return string(runtime, shortName(packageName, className));
	}
	if ([SIGNATURES.flatten, SIGNATURES.flattenShort].includes(signature)) {
		const selected = signature === SIGNATURES.flattenShort
			? shortName(packageName, className)
			: className;
		return string(runtime, `${packageName}/${selected}`);
	}
	if (signature === SIGNATURES.string) {
		return string(runtime, `ComponentInfo{${packageName}/${className}}`);
	}
	throw componentError("ANDROID_COMPONENT_METHOD_UNSUPPORTED", signature);
}

function shortName(packageName, className) {
	return className.startsWith(`${packageName}.`)
		? className.slice(packageName.length)
		: className;
}
function string(runtime, value) { return createGuestString(runtime, value); }
function componentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
