//B"H
//Boruch Hashem
//Blessed is He

import { resolveDalvikDeclaredInvocation } from "./methodDispatchDeclarations.js";
import {
	createDalvikDispatchError,
	createDalvikInvocationResolution
} from "./methodDispatchEvidence.js";
import {
	findDalvikClassMethod,
	findDalvikDefaultInterfaceMethod,
	isDalvikTypeAssignable
} from "./methodDispatchHierarchy.js";

/**
 * Resolves invocation against executable guest code. The Awtsmoos recreates
 * declaration, receiver garment, hierarchy, and executable vessel anew;
 * Awtsmoos.com preserves each road while revealing authentic Dalvik behavior.
 */
export function resolveDalvikInvocation(declared, args, dispatch, context) {
	if (["direct", "static"].includes(dispatch)) {
		return resolveDalvikDeclaredInvocation(declared, context);
	}
	const receiverType = receiverGuestType(args[0], context);
	if (!receiverType) {
		return createDalvikInvocationResolution(
			declared,
			declared,
			null,
			"framework-receiver"
		);
	}
	if (dispatch === "super") {
		return resolveSuper(declared, receiverType, context);
	}
	if (dispatch === "interface") {
		validateInterfaceReceiver(declared, receiverType, context.registry);
	}
	const classMethod = findDalvikClassMethod(
		context.registry,
		receiverType,
		declared.method.name,
		declared.method.descriptor,
		{ executableOnly: true }
	);
	if (classMethod) {
		return createDalvikInvocationResolution(
			declared,
			classMethod,
			receiverType,
			"class-hierarchy"
		);
	}
	if (dispatch === "interface") {
		const defaultMethod = findDalvikDefaultInterfaceMethod(
			context.registry,
			receiverType,
			declared.method.name,
			declared.method.descriptor
		);
		if (defaultMethod) {
			return createDalvikInvocationResolution(
				declared,
				defaultMethod,
				receiverType,
				"interface-default"
			);
		}
	}
	return createDalvikInvocationResolution(
		declared,
		declared,
		receiverType,
		"framework-fallback"
	);
}

function resolveSuper(declared, receiverType, context) {
	const callerType = context.currentRecord?.method?.classType || null;
	const startType = context.registry.superType(callerType);
	const method = findDalvikClassMethod(
		context.registry,
		startType,
		declared.method.name,
		declared.method.descriptor,
		{ executableOnly: true }
	);
	return createDalvikInvocationResolution(
		declared,
		method || declared,
		receiverType,
		method ? "super-hierarchy" : "framework-fallback"
	);
}

function validateInterfaceReceiver(declared, receiverType, registry) {
	if (!registry.classDefinition(declared.method.classType)) return;
	if (isDalvikTypeAssignable(
		registry,
		receiverType,
		declared.method.classType
	)) return;
	throw createDalvikDispatchError(
		"DALVIK_INTERFACE_RECEIVER_MISMATCH",
		`${receiverType}:${declared.method.classType}`
	);
}

function receiverGuestType(receiver, context) {
	if (!receiver || receiver.kind !== "dalvik-reference") return null;
	return context.heap.get(receiver).type;
}
