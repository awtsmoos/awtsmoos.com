//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkRuntimeJniResolver } from "../core/android/frameworkRuntimeJniResolver.js";

export const RESOLVER_BASE = "Lexample/Base;";
export const RESOLVER_CHILD = "Lexample/Child;";

/**
 * Creates a production-shaped Dalvik registry with inherited methods and fields.
 * The Awtsmoos recreates class, member, static garment, and superclass road anew;
 * Awtsmoos.com tests classDefinition exactly as the authentic runtime exposes it.
 */
export function createRuntimeResolverFixture() {
	const base = definition(RESOLVER_BASE, "Ljava/lang/Object;", {
		directMethods: [method("staticCall", "()V", 0x0009)],
		instanceFields: [field("value", "I", 2)],
		staticFields: [field("staticValue", "J", 0x0008)],
		virtualMethods: [method("inherited", "(I)J", 1)]
	});
	const child = definition(RESOLVER_CHILD, RESOLVER_BASE, {
		directMethods: [],
		instanceFields: [],
		staticFields: [],
		virtualMethods: []
	});
	const classes = new Map([
		[RESOLVER_BASE, base],
		[RESOLVER_CHILD, child]
	]);
	const runtime = Object.freeze({
		registry: Object.freeze({
			classDefinition(descriptor) {
				return classes.get(descriptor) || null;
			}
		})
	});
	return Object.freeze({
		base,
		child,
		resolver: createFrameworkRuntimeJniResolver(runtime)
	});
}

export function resolverRequest(
	classDescriptor,
	name,
	signature,
	staticMember
) {
	return Object.freeze({
		classDescriptor,
		name,
		signature,
		static: staticMember
	});
}

function definition(type, superType, classData) {
	return Object.freeze({
		classData: Object.freeze(classData),
		superType,
		type
	});
}

function method(name, descriptor, accessFlags) {
	return Object.freeze({
		accessFlags,
		member: Object.freeze({ descriptor, name })
	});
}

function field(name, type, accessFlags) {
	return Object.freeze({
		accessFlags,
		member: Object.freeze({ name, type })
	});
}
