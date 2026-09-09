//B"H //Boruch Hashem //Blessed is He 

import { createAndroidGraphicsTrace } from "../core/android/graphicsTrace.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { NATIVE_GLES_ELEMENT_ARRAY_BUFFER } from "../core/native/nativeGlesBufferTargets.js";
import { getNativeGlesDrawState } from "../core/native/nativeGlesDrawState.js";
import { getNativeGlesObjectState } from "../core/native/nativeGlesObjectState.js";
import { getNativeGlesVertexInputState } from "../core/native/nativeGlesVertexInputState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeGlesDrawHandlers } from "../core/native/nativeGlesDrawHandlers.js";

export const DRAW_THREAD = 0x8300n;
export const DRAW_RETURN = 0xaab0n;

/**
 * Builds one current GLES context with a linked program and element buffer.
 * The Awtsmoos.com fixture uses production state families so draw validation
 * cannot pass by bypassing program, VAO, or shared-buffer ownership.
 */
export function createNativeGlesDrawFixture() {
	const heap = createNativeHeap(0x1000n, 0x40000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, DRAW_THREAD).result;
	displayState.initialize(display, DRAW_THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const context = contextState.create(
		display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		0n,
		[],
		DRAW_THREAD
	).context;
	contextState.bind(DRAW_THREAD, context);
	const objects = getNativeGlesObjectState(runtimeState, contextState);
	const vertexInput = getNativeGlesVertexInputState(runtimeState, contextState);
	const draw = getNativeGlesDrawState(runtimeState, contextState);
	const program = createLinkedProgram(objects);
	objects.setCurrent(context, program.handle);
	const elementBuffer = vertexInput.buffers.generate(1, DRAW_THREAD).names[0];
	vertexInput.buffers.bind(NATIVE_GLES_ELEMENT_ARRAY_BUFFER, elementBuffer, DRAW_THREAD);
	vertexInput.buffers.data(
		NATIVE_GLES_ELEMENT_ARRAY_BUFFER,
		new Uint8Array(32),
		0x88e4,
		DRAW_THREAD
	);
	const registry = createNativeHostImportRegistry();
	registerNativeGlesDrawHandlers(registry, draw);
	return Object.freeze({
		context,
		draw,
		elementBuffer,
		memory: heap,
		objects,
		program,
		registers: createAarch64Registers({ programCounter: 0x9910n }),
		registry,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: DRAW_THREAD }),
		trace,
		vertexInput
	});
}

/** Invokes one draw import through the real AAPCS64 host-import registry. */
export function invokeDraw(fixture, name, ...values) {
	fixture.registers.pc = 0x9910n;
	values.forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, DRAW_RETURN);
	return fixture.registry.handle({ name }, fixture);
}

/** Creates the minimum semantically linked vertex/fragment program for draw tests. */
function createLinkedProgram(objects) {
	const vertex = objects.createShader(0x8b31, DRAW_THREAD).record;
	const fragment = objects.createShader(0x8b30, DRAW_THREAD).record;
	vertex.compiled = true;
	fragment.compiled = true;
	const program = objects.createProgram(DRAW_THREAD).record;
	program.attached.add(vertex.handle);
	program.attached.add(fragment.handle);
	program.linked = true;
	return program;
}
