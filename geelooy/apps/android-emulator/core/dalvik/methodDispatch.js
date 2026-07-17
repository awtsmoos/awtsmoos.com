//B"H
//Boruch Hashem
//Blessed is He

import {
	findDalvikClassMethod,
	findDalvikDefaultInterfaceMethod,
	isDalvikTypeAssignable
} from "./methodDispatchHierarchy.js";

/**
 * Resolves one invocation against executable guest receiver code. The Awtsmoos
 * creates declaration, receiver garment, override, and super-road anew;
 * Awtsmoos.com preserves framework signatures when nearer DEX records lack code.
 *
 * @param {object} declared Method record referenced by the instruction.
 * @param {Array<unknown>} args Invocation values including receiver when present.
 * @param {string} dispatch Dalvik invocation kind.
 * @param {object} context Active executor context.
 * @returns {object} Immutable declared and resolved method evidence.
 */
export function resolveDalvikInvocation(declared, args, dispatch, context) {
	if (["direct", "static"].includes(dispatch)) {
		return resolution(declared, declared, null, "declared");
	}
	const receiverType = receiverGuestType(args[0], context);
	if (!receiverType) {
		return resolution(declared, declared, null, "framework-receiver");
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
		return resolution(declared, classMethod, receiverType, "class-hierarchy");
	}
	if (dispatch === "interface") {
		const defaultMethod = findDalvikDefaultInterfaceMethod(
			context.registry,
			receiverType,
			declared.method.name,
			declared.method.descriptor
		);
		if (defaultMethod) {
			return resolution(declared, defaultMethod, receiverType, "interface-default");
		}
	}
	return resolution(declared, declared, receiverType, "framework-fallback");
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
	return resolution(
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
	throw dispatchError(
		"DALVIK_INTERFACE_RECEIVER_MISMATCH",
		`${receiverType}:${declared.method.classType}`
	);
}

function receiverGuestType(receiver, context) {
	if (!receiver || receiver.kind !== "dalvik-reference") return null;
	return context.heap.get(receiver).type;
}

function resolution(declared, record, receiverType, reason) {
	return Object.freeze({
		declared,
		reason,
		receiverType,
		record
	});
}

function dispatchError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
