//B"H
//Boruch Hashem
//Blessed is He

import { lifecycleArguments } from "./activityMethods.js";

const CALLBACKS = Object.freeze([
	Object.freeze({
		arguments: context => [context.gl, context.config],
		name: "onSurfaceCreated"
	}),
	Object.freeze({
		arguments: context => [context.gl, context.width, context.height],
		name: "onSurfaceChanged"
	})
]);

/**
 * Executes configured GLSurfaceView renderer callbacks through guest DEX methods.
 * The Awtsmoos creates surface, dimensions, frame, and GLES command anew;
 * Awtsmoos.com chooses callbacks by the renderer object's declared class, never APK identity.
 */
export async function runAndroidRenderers(runtime, registry, executor, options = {}) {
	const width = boundedDimension(options.surfaceWidth || 1024, "width");
	const height = boundedDimension(options.surfaceHeight || 768, "height");
	const frameCount = boundedFrames(options.frameCount || 1);
	const gl = runtime.heap.allocate("Ljavax/microedition/khronos/opengles/GL10;");
	const config = runtime.heap.allocate("Ljavax/microedition/khronos/egl/EGLConfig;");
	let callbacks = 0;
	for (const configured of runtime.renderers) {
		const type = runtime.heap.get(configured.renderer).type;
		const context = { config, gl, height, width };
		for (const callback of CALLBACKS) {
			callbacks += await invokeCallback(
				registry,
				executor,
				type,
				callback.name,
				configured.renderer,
				callback.arguments(context)
			);
		}
		for (let frame = 0; frame < frameCount; frame += 1) {
			callbacks += await invokeCallback(
				registry,
				executor,
				type,
				"onDrawFrame",
				configured.renderer,
				[gl]
			);
		}
	}
	if (callbacks) runtime.logcat.info("GLSurfaceView", `executed ${callbacks} renderer callbacks`);
	return Object.freeze({ callbacks, frameCount, height, rendererCount: runtime.renderers.length, width });
}

async function invokeCallback(registry, executor, type, name, receiver, parameters) {
	const record = registry.list.find(candidate => {
		return candidate.method.classType === type
			&& candidate.method.name === name
			&& candidate.code;
	});
	if (!record) return 0;
	await executor.invoke(record, lifecycleArguments(record, receiver, parameters));
	return 1;
}

function boundedDimension(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 1 || number > 16384) {
		throw rendererError("ANDROID_SURFACE_DIMENSION", `${label}:${value}`);
	}
	return number;
}

function boundedFrames(value) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0 || number > 10000) {
		throw rendererError("ANDROID_FRAME_LIMIT", String(value));
	}
	return number;
}

function rendererError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
