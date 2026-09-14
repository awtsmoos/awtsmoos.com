//B"H
//Boruch Hashem
//Blessed be He

import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";

const STATES = new WeakMap();
const ENABLE_CAPS = new Set([
	0x0b44,
	0x0bd0,
	0x0be2,
	0x0b71,
	0x0b90,
	0x0c11,
	0x8037,
	0x809e,
	0x80a0
]);
const HINT_MODES = new Set([0x1100, 0x1101, 0x1102]);
const GENERATE_MIPMAP_HINT = 0x8192;

/**
 * Retains context-local GLES pipeline capability state while emitting generic
 * renderer IR. Invalid enums set the shared first-error domain before tracing.
 */
export function getNativeGlesPipelineState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const domain = getNativeGlesQueryDomain(eglContextState);
	const enabledByContext = new Map();
	const state = Object.freeze({
		command(method, args, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return outcome(query.context, false);
			if (!validate(method, args, domain, query.thread)) {
				return outcome(query.context, false);
			}
			updateEnabled(enabledByContext, query.context, method, args);
			runtimeState.nativeGraphicsTrace?.gles(Object.freeze({
				args: Object.freeze([...args]),
				context: BigInt(query.context).toString(),
				kind: "simple-command",
				method
			}));
			return outcome(query.context, true);
		},
		domain,
		enabled(capabilityValue, threadValue) {
			const query = domain.prepare(threadValue);
			const capability = Number(capabilityValue);
			if (!query.valid) return enabledOutcome(false, false);
			if (!ENABLE_CAPS.has(capability)) {
				domain.invalidEnum(query.thread);
				return enabledOutcome(false, false);
			}
			const values = enabledByContext.get(key(query.context));
			return enabledOutcome(true, Boolean(values?.has(capability)));
		}
	});
	STATES.set(runtimeState, state);
	return state;
}

/** Validates commands whose legal enum domain is not represented by raw ABI types. */
function validate(method, args, domain, thread) {
	if (["enable", "disable"].includes(method) && !ENABLE_CAPS.has(Number(args[0]))) {
		domain.invalidEnum(thread);
		return false;
	}
	if (method === "hint") {
		if (Number(args[0]) !== GENERATE_MIPMAP_HINT || !HINT_MODES.has(Number(args[1]))) {
			domain.invalidEnum(thread);
			return false;
		}
	}
	return true;
}

/** Applies enable/disable commands to the context-local capability set. */
function updateEnabled(byContext, context, method, args) {
	if (!["enable", "disable"].includes(method)) return;
	const contextKey = key(context);
	if (!byContext.has(contextKey)) byContext.set(contextKey, new Set());
	const capability = Number(args[0]);
	if (method === "enable") byContext.get(contextKey).add(capability);
	else byContext.get(contextKey).delete(capability);
}

/** Creates one stable context-key string. */
function key(value) {
	return BigInt(value).toString();
}

/** Creates one immutable command result. */
function outcome(context, success) {
	return Object.freeze({ context, success });
}

/** Creates one immutable glIsEnabled result. */
function enabledOutcome(success, enabled) {
	return Object.freeze({ enabled, success });
}
