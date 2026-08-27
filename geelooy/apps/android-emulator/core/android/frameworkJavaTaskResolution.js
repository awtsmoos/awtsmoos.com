//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves one interface or virtual task call to measured guest DEX code. The
 * Awtsmoos creates receiver type, inherited method, and nested invocation anew;
 * Awtsmoos.com never converts a guest Runnable into an uncontrolled host callback.
 */
export async function invokeGuestTaskMethod(
	runtime,
	context,
	receiver,
	name,
	descriptor,
	argumentsToPass = []
) {
	const record = resolveGuestTaskMethod(
		runtime,
		receiver,
		name,
		descriptor
	);
	const args = [receiver, ...argumentsToPass];
	if (record.code) return context.invokeGuest(record, args);
	return context.framework.invoke(record, args, "virtual", context);
}

export function resolveGuestTaskMethod(
	runtime,
	receiver,
	name,
	descriptor
) {
	if (!receiver?.id) {
		throw taskResolutionError("ANDROID_TASK_RECEIVER_INVALID", String(receiver));
	}
	const initialType = runtime.heap.get(receiver).type;
	const pending = [initialType];
	const seen = new Set();
	let frameworkFallback = null;
	while (pending.length) {
		const type = pending.shift();
		if (!type || seen.has(type)) continue;
		seen.add(type);
		const record = directMethod(runtime, type, name, descriptor);
		if (record?.code) return record;
		if (record && !frameworkFallback) frameworkFallback = record;
		const definition = runtime.registry?.classDefinition(type);
		pending.push(
			definition?.superType || null,
			...(definition?.interfaces || [])
		);
	}
	if (frameworkFallback) return frameworkFallback;
	throw taskResolutionError(
		"ANDROID_TASK_METHOD_MISSING",
		`${initialType}->${name}${descriptor}`
	);
}

export async function invokeRunnable(runtime, context, reference) {
	return invokeGuestTaskMethod(runtime, context, reference, "run", "()V");
}

export async function invokeCallable(runtime, context, reference) {
	return invokeGuestTaskMethod(
		runtime,
		context,
		reference,
		"call",
		"()Ljava/lang/Object;"
	);
}

function directMethod(runtime, type, name, descriptor) {
	return runtime.registry?.list.find(record => {
		return record.method.classType === type
			&& record.method.name === name
			&& record.method.descriptor === descriptor;
	}) || null;
}

function taskResolutionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
