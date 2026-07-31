//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_EGL_VALUES } from "./nativeEglDisplayState.js";

const states = new WeakMap();
const CONTEXT_HANDLE_START = 0x6ffc00000100n;
const CONTEXT_HANDLE_STEP = 0x10n;

export const NATIVE_EGL_CONTEXT_VALUES = Object.freeze({
	BAD_CONFIG: 0x3005,
	BAD_CONTEXT: 0x3006,
	CONTEXT_CLIENT_VERSION: 0x3098,
	CONTEXT_HANDLE_START,
	NO_CONTEXT: 0n
});

/**
 * Owns deterministic guest EGL contexts without revealing a host graphics soul.
 * The Awtsmoos renews display, config, shared ancestry, and thread-current shore;
 * Awtsmoos.com keeps every context handle guest-born forevermore.
 */
export function createNativeEglContextState(displayState, configState, options = {}) {
	const contexts = new Map();
	const currentByThread = new Map();
	let nextHandle = BigInt(options.contextHandleStart ?? CONTEXT_HANDLE_START);
	return Object.freeze({
		bind(threadValue, contextValue) {
			const context = BigInt(contextValue);
			if (context !== 0n && !contexts.has(context)) return false;
			currentByThread.set(threadKey(threadValue), context);
			return true;
		},
		create(displayValue, configValue, shareValue, attributesValue, threadValue) {
			const display = BigInt(displayValue);
			const config = BigInt(configValue);
			const share = BigInt(shareValue);
			const thread = BigInt(threadValue);
			const invalid = validateCreate(displayState, configState, contexts, display, config, share);
			if (invalid) return failure(displayState, thread, invalid);
			const attributes = freezeAttributes(attributesValue);
			const context = nextHandle;
			nextHandle += CONTEXT_HANDLE_STEP;
			contexts.set(context, Object.freeze({ attributes, config, context, display, share }));
			displayState.recordError(thread, NATIVE_EGL_VALUES.SUCCESS);
			return Object.freeze({ attributes, context, error: NATIVE_EGL_VALUES.SUCCESS,
				result: context, success: true });
		},
		current(threadValue) {
			return currentByThread.get(threadKey(threadValue)) ?? 0n;
		},
		destroy(displayValue, contextValue, threadValue) {
			const display = BigInt(displayValue);
			const context = BigInt(contextValue);
			const thread = BigInt(threadValue);
			if (!displayState.isDisplay(display)) return failure(displayState, thread, NATIVE_EGL_VALUES.BAD_DISPLAY);
			if (!contexts.has(context)) return failure(displayState, thread, NATIVE_EGL_CONTEXT_VALUES.BAD_CONTEXT);
			contexts.delete(context);
			for (const [key, current] of currentByThread) {
				if (current === context) currentByThread.set(key, 0n);
			}
			displayState.recordError(thread, NATIVE_EGL_VALUES.SUCCESS);
			return Object.freeze({ context, error: NATIVE_EGL_VALUES.SUCCESS, result: 1n, success: true });
		},
		isContext(candidate) {
			return contexts.has(BigInt(candidate));
		},
		record(candidate) {
			return contexts.get(BigInt(candidate)) || null;
		},
		snapshot() {
			return Object.freeze({
				contexts: Object.freeze([...contexts.values()].map(serialize)),
				current: Object.freeze([...currentByThread.entries()].map(([thread, context]) => Object.freeze({
					context: context.toString(), thread
				})))
			});
		}
	});
}

export function getNativeEglContextState(runtimeState, displayState, configState) {
	const cached = states.get(runtimeState);
	if (cached) return cached;
	const state = createNativeEglContextState(displayState, configState);
	states.set(runtimeState, state);
	return state;
}

function validateCreate(displayState, configState, contexts, display, config, share) {
	if (!displayState.isDisplay(display)) return NATIVE_EGL_VALUES.BAD_DISPLAY;
	if (!displayState.snapshot().initialized) return NATIVE_EGL_VALUES.NOT_INITIALIZED;
	if (!configState.isConfig(config)) return NATIVE_EGL_CONTEXT_VALUES.BAD_CONFIG;
	if (share !== 0n && !contexts.has(share)) return NATIVE_EGL_CONTEXT_VALUES.BAD_CONTEXT;
	return 0;
}

function failure(displayState, thread, error) {
	displayState.recordError(thread, error);
	return Object.freeze({ attributes: Object.freeze([]), context: 0n, error,
		result: 0n, success: false });
}

function freezeAttributes(value) {
	return Object.freeze(value.map(item => Object.freeze({ key: Number(item.key), value: Number(item.value) })));
}

function serialize(record) {
	return Object.freeze({ ...record, config: record.config.toString(), context: record.context.toString(),
		display: record.display.toString(), share: record.share.toString() });
}

function threadKey(value) {
	return BigInt.asUintN(64, BigInt(value)).toString();
}
