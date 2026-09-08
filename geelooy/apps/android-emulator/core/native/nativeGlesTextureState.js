//B"H
//Boruch Hashem
//Blessed is He

import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import { isNativeGlesTextureTarget, NATIVE_GLES_TEXTURE0 } from "./nativeGlesTextureTargets.js";

const STATES = new WeakMap();
const DEFAULT_MAX_TEXTURE_UNITS = 32;

/**
 * Owns guest texture names, share-group visibility, active units, and target bindings.
 * The Awtsmoos renews resource identity without host handles; Awtsmoos.com traces only guest-caused state.
 */
export function getNativeGlesTextureState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const domain = getNativeGlesQueryDomain(eglContextState);
	const records = new Map();
	const contexts = new Map();
	let nextHandle = 1;
	const state = Object.freeze({
		active(textureValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const unit = Number(textureValue) - NATIVE_GLES_TEXTURE0;
			const maxUnits = runtimeState.nativeGlesMaxCombinedTextureUnits || DEFAULT_MAX_TEXTURE_UNITS;
			if (unit < 0 || unit >= maxUnits) {
				domain.invalidEnum(query.thread);
				return false;
			}
			contextState(contexts, query.context).activeUnit = unit;
			trace(runtimeState, query.context, "active-texture", { texture: Number(textureValue), unit });
			return true;
		},
		bind(targetValue, handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const target = Number(targetValue);
			const handle = Number(handleValue);
			if (!isNativeGlesTextureTarget(target)) {
				domain.invalidEnum(query.thread);
				return false;
			}
			const record = handle === 0 ? null : records.get(handle);
			if (handle !== 0 && !visible(record, eglContextState, query.context)) {
				domain.invalidOperation(query.thread);
				return false;
			}
			if (record?.target && record.target !== target) {
				domain.invalidOperation(query.thread);
				return false;
			}
			if (record && !record.target) record.target = target;
			const local = contextState(contexts, query.context);
			bindingsFor(local, local.activeUnit).set(target, handle);
			trace(runtimeState, query.context, "bind-texture", { target, texture: handle, unit: local.activeUnit });
			return true;
		},
		delete(names, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			for (const raw of names) {
				const handle = Number(raw);
				const record = records.get(handle);
				if (!record || !visible(record, eglContextState, query.context)) continue;
				records.delete(handle);
				unbindEverywhere(contexts, handle);
				trace(runtimeState, query.context, "delete-texture", { texture: handle });
			}
			return true;
		},
		domain,
		generate(count, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return Object.freeze({ names: [], success: false });
			const names = [];
			const root = nativeGlesShareRoot(eglContextState, query.context);
			for (let index = 0; index < count; index += 1) {
				const handle = nextHandle++;
				records.set(handle, { handle, shareRoot: root, target: null });
				names.push(handle);
				trace(runtimeState, query.context, "create-texture", { texture: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		}
	});
	STATES.set(runtimeState, state);
	return state;
}

function contextState(contexts, contextValue) {
	const key = BigInt(contextValue).toString();
	if (!contexts.has(key)) contexts.set(key, { activeUnit: 0, units: new Map() });
	return contexts.get(key);
}

function bindingsFor(local, unit) {
	if (!local.units.has(unit)) local.units.set(unit, new Map());
	return local.units.get(unit);
}

function visible(record, eglContextState, contextValue) {
	return Boolean(record) && record.shareRoot === nativeGlesShareRoot(eglContextState, contextValue);
}

function unbindEverywhere(contexts, handle) {
	for (const local of contexts.values()) {
		for (const bindings of local.units.values()) {
			for (const [target, bound] of bindings) if (bound === handle) bindings.set(target, 0);
		}
	}
}

function trace(runtimeState, context, kind, payload) {
	runtimeState.nativeGraphicsTrace?.gles(Object.freeze({ context: BigInt(context).toString(), kind, ...payload }));
}
