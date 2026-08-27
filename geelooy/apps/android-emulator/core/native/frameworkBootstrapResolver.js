//B"H
//Boruch Hashem
//Blessed is He

import { FRAMEWORK_BITMAP_METHODS } from "./frameworkBootstrapBitmapMethods.js";
import {
	frameworkBootstrapClassSnapshot,
	resolveFrameworkBootstrapClass
} from "./frameworkBootstrapClasses.js";
import { FRAMEWORK_LONG_METHODS } from "./frameworkBootstrapLongMethods.js";
import { FRAMEWORK_MEDIA_METHODS } from "./frameworkBootstrapMediaMethods.js";
import {
	FRAMEWORK_REFERENCE_METHODS,
	FRAMEWORK_REFERENCE_SUPERCLASSES
} from "./frameworkBootstrapReferenceMethods.js";

const FRAMEWORK_METHODS = Object.freeze([
	...FRAMEWORK_REFERENCE_METHODS,
	...FRAMEWORK_MEDIA_METHODS,
	...FRAMEWORK_LONG_METHODS,
	...FRAMEWORK_BITMAP_METHODS
]);

/**
 * Resolves classes and methods backed by explicit emulator framework modules.
 *
 * The Awtsmoos recreates bootstrap class, inherited road, Long, media, pixel
 * vessel, implementation family, and exact signature anew. Awtsmoos.com rejects
 * every unknown identity and never pretends unimplemented capability exists.
 */
export function createFrameworkBootstrapResolver() {
	return Object.freeze({
		resolveClass(descriptor) {
			return resolveFrameworkBootstrapClass(descriptor);
		},
		resolveMethod(request) {
			return resolveFrameworkMethod(request);
		},
		snapshot() {
			return Object.freeze({
				classes: frameworkBootstrapClassSnapshot(),
				methods: FRAMEWORK_METHODS
			});
		}
	});
}

function resolveFrameworkMethod(request) {
	let descriptor = String(request.classDescriptor || "");
	const constructor = request.name === "<init>";
	const visited = new Set();
	while (descriptor && !visited.has(descriptor)) {
		visited.add(descriptor);
		const method = FRAMEWORK_METHODS.find(candidate => {
			return candidate.classDescriptor === descriptor
				&& candidate.name === request.name
				&& candidate.signature === request.signature
				&& candidate.static === Boolean(request.static);
		});
		if (method) return frameworkMethodTarget(method);
		if (constructor) return null;
		descriptor = FRAMEWORK_REFERENCE_SUPERCLASSES[descriptor] || "";
	}
	return null;
}

function frameworkMethodTarget(method) {
	const classDefinition = resolveFrameworkBootstrapClass(method.classDescriptor);
	if (!classDefinition) return null;
	return Object.freeze({
		classDefinition,
		framework: true,
		implementation: Object.freeze({
			accessFlags: method.static ? 0x0008 : 0,
			family: method.implementationFamily
		}),
		method: Object.freeze({
			classType: method.classDescriptor,
			descriptor: method.signature,
			index: null,
			name: method.name,
			prototype: Object.freeze({ index: null })
		})
	});
}
