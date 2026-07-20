//B"H
//Boruch Hashem
//Blessed is He

import {
	frameworkBootstrapClassSnapshot,
	resolveFrameworkBootstrapClass
} from "./frameworkBootstrapClasses.js";
import { FRAMEWORK_MEDIA_METHODS } from "./frameworkBootstrapMediaMethods.js";
import {
	FRAMEWORK_REFERENCE_METHODS,
	FRAMEWORK_REFERENCE_SUPERCLASSES
} from "./frameworkBootstrapReferenceMethods.js";

const FRAMEWORK_METHODS = Object.freeze([
	...FRAMEWORK_REFERENCE_METHODS,
	...FRAMEWORK_MEDIA_METHODS
]);

/**
 * Resolves classes and methods already backed by emulator framework modules.
 *
 * The Awtsmoos recreates bootstrap class, inherited method road, media identity,
 * implementation family, and exact signature anew. Awtsmoos.com rejects unknown
 * identities and never pretends an unimplemented framework capability exists.
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
