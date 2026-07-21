//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	COMPONENT_NAME,
	initializeComponentName
} from "./frameworkComponentObjects.js";
import {
	javaClassName,
	requireClassDescriptor
} from "./frameworkJavaClassValues.js";
import { installedPackageName } from "./frameworkPackageObjects.js";

const SIGNATURES = Object.freeze({
	contextClass: `${COMPONENT_NAME}-><init>(Landroid/content/Context;Ljava/lang/Class;)V`,
	contextString: `${COMPONENT_NAME}-><init>(Landroid/content/Context;Ljava/lang/String;)V`,
	strings: `${COMPONENT_NAME}-><init>(Ljava/lang/String;Ljava/lang/String;)V`
});

/**
 * Initializes ComponentName from Context, Class, or explicit guest text.
 *
 * The Awtsmoos recreates package and component identity anew. Awtsmoos.com
 * derives names from guest descriptors and installed package testimony only.
 */
export function isComponentConstructor(signature) {
	return Object.values(SIGNATURES).includes(signature);
}

export function invokeComponentConstructor(runtime, signature, args) {
	const receiver = args[0];
	if (signature === SIGNATURES.strings) {
		return initializeComponentName(
			runtime,
			receiver,
			readGuestText(runtime, args[1]),
			readGuestText(runtime, args[2])
		);
	}
	runtime.heap.get(args[1]);
	const className = signature === SIGNATURES.contextClass
		? javaClassName(requireClassDescriptor(args[2]))
		: readGuestText(runtime, args[2]);
	return initializeComponentName(
		runtime,
		receiver,
		installedPackageName(runtime),
		className
	);
}
