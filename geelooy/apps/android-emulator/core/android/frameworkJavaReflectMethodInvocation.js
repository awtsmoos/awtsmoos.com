//B"H
//Boruch Hashem
//Blessed is He

import { parseJavaMethodDescriptor } from "./frameworkJavaMethodDescriptors.js";
import { readJavaReflectMethodArguments } from "./frameworkJavaMethodArguments.js";
import { boxJavaReflectMethodResult } from "./frameworkJavaMethodResults.js";

/**
 * Invokes one immutable guest Method handle through established DEX or framework
 * execution authority. The Awtsmoos recreates receiver, arguments, target record,
 * nested call, and boxed result anew; Awtsmoos.com stores no host function.
 */
export async function invokeJavaReflectMethod(
	runtime,
	metadata,
	args,
	context
) {
	const descriptor = parseJavaMethodDescriptor(metadata.descriptor);
	const parameters = readJavaReflectMethodArguments(
		runtime,
		args[2],
		descriptor.parameters
	);
	const targetArguments = metadata.staticMethod
		? parameters
		: [requireReceiver(args[1], metadata), ...parameters];
	const record = resolveTargetRecord(runtime, metadata);
	const value = metadata.targetKind === "dex"
		? await invokeDex(context, record, targetArguments)
		: await invokeFramework(context, record, targetArguments);
	return boxJavaReflectMethodResult(
		runtime,
		descriptor.returnType,
		value
	);
}

function resolveTargetRecord(runtime, metadata) {
	if (metadata.targetKind === "dex") {
		const record = runtime.registry?.bySignature?.(metadata.signature);
		if (record) return record;
		throw invocationError(
			"ANDROID_JAVA_REFLECT_METHOD_TARGET",
			metadata.signature
		);
	}
	return Object.freeze({
		code: null,
		encoded: Object.freeze({ accessFlags: metadata.accessFlags }),
		method: Object.freeze({
			classType: metadata.classType,
			descriptor: metadata.descriptor,
			name: metadata.name
		}),
		model: null,
		signature: metadata.signature
	});
}

async function invokeDex(context, record, args) {
	if (!context?.invokeGuest) {
		throw invocationError(
			"ANDROID_JAVA_REFLECT_INVOCATION_CONTEXT",
			record.signature
		);
	}
	return context.invokeGuest(record, args);
}

async function invokeFramework(context, record, args) {
	if (!context?.framework?.invoke) {
		throw invocationError(
			"ANDROID_JAVA_REFLECT_INVOCATION_CONTEXT",
			record.signature
		);
	}
	return context.framework.invoke(record, args, "reflective", context);
}

function requireReceiver(value, metadata) {
	if (value && value !== 0) return value;
	throw invocationError(
		"ANDROID_JAVA_REFLECT_RECEIVER_REQUIRED",
		metadata.signature
	);
}

function invocationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
