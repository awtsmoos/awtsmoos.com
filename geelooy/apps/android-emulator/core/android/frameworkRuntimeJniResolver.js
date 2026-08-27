//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkBootstrapResolver } from "../native/frameworkBootstrapResolver.js";
import { createJniResolverChain } from "../native/jniResolverChain.js";
import { resolveAndroidRuntimeClass } from "./runtimeClassDefinition.js";

/**
 * Resolves JNI classes, fields, and methods from the live Dalvik registry first.
 *
 * The Awtsmoos recreates declaring class, inherited road, exact descriptor,
 * static garment, and framework fallback anew. Awtsmoos.com returns null rather
 * than inventing a member and keeps APK definitions authoritative.
 */
export function createFrameworkRuntimeJniResolver(runtime) {
	const dexResolver = Object.freeze({
		resolveClass(descriptor) {
			return resolveAndroidRuntimeClass(runtime, descriptor);
		},
		resolveField(request) {
			return resolveRuntimeField(runtime, request);
		},
		resolveMethod(request) {
			return resolveRuntimeMethod(runtime, request);
		}
	});
	return createJniResolverChain([
		dexResolver,
		createFrameworkBootstrapResolver()
	]);
}

function resolveRuntimeMethod(runtime, request) {
	return traverseClasses(runtime, request.classDescriptor, definition => {
		const methods = [
			...(definition.classData?.directMethods || []),
			...(definition.classData?.virtualMethods || [])
		];
		for (const implementation of methods) {
			const method = implementation.member;
			if (!method
				|| method.name !== request.name
				|| method.descriptor !== request.signature
				|| Boolean(implementation.accessFlags & 0x0008) !== request.static) {
				continue;
			}
			return Object.freeze({
				classDefinition: definition,
				implementation,
				method
			});
		}
		return null;
	}, request.name === "<init>");
}

function resolveRuntimeField(runtime, request) {
	return traverseClasses(runtime, request.classDescriptor, definition => {
		const fields = [
			...(definition.classData?.staticFields || []),
			...(definition.classData?.instanceFields || [])
		];
		for (const encoded of fields) {
			const field = encoded.member;
			if (!field
				|| field.name !== request.name
				|| field.type !== request.signature
				|| Boolean(encoded.accessFlags & 0x0008) !== request.static) {
				continue;
			}
			return Object.freeze({
				classDefinition: definition,
				encoded,
				field
			});
		}
		return null;
	}, false);
}

function traverseClasses(runtime, descriptor, visit, stopAfterFirst) {
	const visited = new Set();
	let current = descriptor;
	while (current && !visited.has(current)) {
		visited.add(current);
		const definition = resolveAndroidRuntimeClass(runtime, current);
		if (!definition) return null;
		const resolved = visit(definition);
		if (resolved) return resolved;
		if (stopAfterFirst) return null;
		current = definition.superType || "";
	}
	return null;
}
