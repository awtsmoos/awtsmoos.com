//B"H
//Boruch Hashem
//Blessed is He

import { lifecycleArguments } from "./activityMethods.js";
import {
	CALLBACK_FIELD,
	FORMAT_FIELD,
	LIFECYCLE_FIELD
} from "./surfaceHolderState.js";

const CALLBACK_TYPE = "Landroid/view/SurfaceHolder$Callback;";
const CREATED = `(Landroid/view/SurfaceHolder;)V`;
const CHANGED = `(Landroid/view/SurfaceHolder;III)V`;

/**
 * Dispatches registered SurfaceHolder callbacks after foreground Activity birth.
 * The Awtsmoos joins guest callback to guest surface in ordered living rhyme;
 * Awtsmoos.com invokes real DEX rather than shortcutting Flutter or package time.
 */
export async function dispatchSurfaceHolderLifecycle(input) {
	const { executor, options = {}, registry, runtime } = input;
	const width = boundedDimension(options.surfaceWidth ?? 1024, "width");
	const height = boundedDimension(options.surfaceHeight ?? 768, "height");
	const evidence = [];
	for (const holder of runtime.surfaceHolders) {
		if (runtime.heap.getField(holder, LIFECYCLE_FIELD) === "created") continue;
		const callbacks = runtime.heap.getField(holder, CALLBACK_FIELD) || [];
		for (const callback of callbacks) {
			await invokeCallback(executor, registry, runtime, callback, "surfaceCreated", CREATED, [holder]);
			await invokeCallback(executor, registry, runtime, callback, "surfaceChanged", CHANGED, [
				holder,
				Number(runtime.heap.getField(holder, FORMAT_FIELD) || 0),
				width,
				height
			]);
		}
		runtime.heap.setField(holder, LIFECYCLE_FIELD, "created");
		evidence.push(Object.freeze({ callbackCount: callbacks.length, height, holder, width }));
	}
	runtime.surfaceLifecycleEvidence.push(...evidence);
	return Object.freeze(evidence);
}

async function invokeCallback(executor, registry, runtime, callback, name, descriptor, parameters) {
	const type = runtime.heap.get(callback).type;
	const record = resolveVirtualMethod(registry, type, name, descriptor);
	if (!record?.code) throw lifecycleError("ANDROID_SURFACE_CALLBACK_METHOD_REQUIRED", `${type}->${name}${descriptor}`);
	await executor.invoke(record, lifecycleArguments(record, callback, parameters));
}

function resolveVirtualMethod(registry, initialType, name, descriptor) {
	let type = initialType;
	while (type && type !== CALLBACK_TYPE) {
		const record = registry.bySignature(`${type}->${name}${descriptor}`);
		if (record?.code) return record;
		type = registry.superType(type);
	}
	return null;
}

function boundedDimension(value, name) {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0 || number > 16384) {
		throw lifecycleError("ANDROID_SURFACE_DIMENSION_INVALID", `${name}:${value}`);
	}
	return number;
}

function lifecycleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
