//B"H
//Boruch Hashem
//Blessed is He

import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { NATIVE_GLES_OBJECT_VALUES } from "./nativeGlesObjectValues.js";

const STATES = new WeakMap();

/**
 * Owns share-group-aware guest shader and program objects for one native runtime.
 * The Awtsmoos renews handle, context, source, and link in one causal stream;
 * Awtsmoos.com records guest GLES deeds rather than painting a counterfeit dream.
 */
export function createNativeGlesObjectState(runtimeState, eglContextState) {
	const domain = getNativeGlesQueryDomain(eglContextState);
	const shaders = new Map();
	const programs = new Map();
	const currentPrograms = new Map();
	let nextHandle = 1;
	function createShader(typeValue, threadValue) {
		const type = Number(typeValue);
		const query = domain.prepare(threadValue);
		if (!query.valid) return failed(query.context);
		if (![NATIVE_GLES_OBJECT_VALUES.VERTEX_SHADER, NATIVE_GLES_OBJECT_VALUES.FRAGMENT_SHADER].includes(type)) {
			domain.invalidEnum(query.thread);
			return failed(query.context);
		}
		const record = { compiled: false, deleted: false, handle: nextHandle++, infoLog: "",
			shareRoot: shareRoot(eglContextState, query.context), source: "", type };
		shaders.set(record.handle, record);
		recordTrace(runtimeState, query.context, "create-shader", { shader: record.handle, shaderType: type });
		return success(query.context, record.handle, record);
	}
	function createProgram(threadValue) {
		const query = domain.prepare(threadValue);
		if (!query.valid) return failed(query.context);
		const record = { attached: new Set(), attribBindings: new Map(), deleted: false,
			handle: nextHandle++, infoLog: "", linked: false, shareRoot: shareRoot(eglContextState, query.context),
			validated: false };
		programs.set(record.handle, record);
		recordTrace(runtimeState, query.context, "create-program", { program: record.handle });
		return success(query.context, record.handle, record);
	}
	function find(map, handleValue, threadValue) {
		const handle = Number(handleValue);
		const query = domain.prepare(threadValue);
		if (!query.valid) return failed(query.context);
		const record = map.get(handle);
		if (!record || record.shareRoot !== shareRoot(eglContextState, query.context)) {
			domain.invalidValue(query.thread);
			return failed(query.context);
		}
		return success(query.context, handle, record);
	}
	return Object.freeze({
		createProgram,
		createShader,
		domain,
		program: (handle, thread) => find(programs, handle, thread),
		record: (context, kind, payload) => recordTrace(runtimeState, context, kind, payload),
		setCurrent(context, handle) {
			currentPrograms.set(BigInt(context).toString(), Number(handle));
		},
		shader: (handle, thread) => find(shaders, handle, thread),
		snapshot: () => snapshot(shaders, programs, currentPrograms)
	});
}

export function getNativeGlesObjectState(runtimeState, eglContextState) {
	if (!STATES.has(runtimeState)) {
		STATES.set(runtimeState, createNativeGlesObjectState(runtimeState, eglContextState));
	}
	return STATES.get(runtimeState);
}

function shareRoot(eglContextState, contextValue) {
	let context = BigInt(contextValue);
	const seen = new Set();
	while (context !== 0n && !seen.has(context.toString())) {
		seen.add(context.toString());
		const record = eglContextState.record(context);
		if (!record || record.share === 0n) return context;
		context = record.share;
	}
	return context;
}

function recordTrace(runtimeState, context, kind, payload) {
	runtimeState.nativeGraphicsTrace?.gles(Object.freeze({ context: BigInt(context).toString(), kind, ...payload }));
}

function success(context, result, record) {
	return Object.freeze({ context, record, result, success: true });
}

function failed(context) {
	return Object.freeze({ context, record: null, result: 0, success: false });
}

function snapshot(shaders, programs, currentPrograms) {
	return Object.freeze({
		currentPrograms: Object.freeze([...currentPrograms.entries()]),
		programs: Object.freeze([...programs.values()].map(value => Object.freeze({ ...value,
			attached: Object.freeze([...value.attached]), attribBindings: Object.freeze([...value.attribBindings.entries()]) }))),
		shaders: Object.freeze([...shaders.values()].map(value => Object.freeze({ ...value })))
	});
}
