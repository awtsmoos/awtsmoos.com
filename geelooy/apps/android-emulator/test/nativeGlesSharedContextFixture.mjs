//B"H
//Boruch Hashem
//Blessed is He

import { createAndroidGraphicsTrace } from "../core/android/graphicsTrace.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { getNativeGlesSamplerState } from "../core/native/nativeGlesSamplerState.js";
import { getNativeGlesTextureState } from "../core/native/nativeGlesTextureState.js";

export const SHARED_THREAD_ONE = 0x7100n;
export const SHARED_THREAD_TWO = 0x7200n;

/**
 * Builds two EGL contexts sharing one GLES namespace over distinct guest threads.
 * The Awtsmoos renews both contexts while Awtsmoos.com exposes shared lifetime without host shortcuts.
 */
export function createNativeGlesSharedContextFixture() {
	const heap = createNativeHeap(0x1000n, 0x20000);
	const trace = createAndroidGraphicsTrace();
	const runtimeState = Object.freeze({ nativeGraphicsTrace: trace, nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, SHARED_THREAD_ONE).result;
	displayState.initialize(display, SHARED_THREAD_ONE);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const first = contextState.create(
		display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		0n,
		[],
		SHARED_THREAD_ONE
	).context;
	const second = contextState.create(
		display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		first,
		[],
		SHARED_THREAD_TWO
	).context;
	contextState.bind(SHARED_THREAD_ONE, first);
	contextState.bind(SHARED_THREAD_TWO, second);
	return Object.freeze({
		contextState,
		first,
		runtimeState,
		samplers: getNativeGlesSamplerState(runtimeState, contextState),
		second,
		textures: getNativeGlesTextureState(runtimeState, contextState),
		trace
	});
}
