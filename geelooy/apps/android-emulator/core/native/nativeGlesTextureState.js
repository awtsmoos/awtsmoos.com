//B"H
//Boruch Hashem
//Blessed be He

import { createNativeGlesTextureContextStore } from "./nativeGlesTextureContextStore.js";
import { createNativeGlesTextureQueryMethods } from "./nativeGlesTextureQueryMethods.js";
import { createNativeGlesTextureUtilityMethods } from "./nativeGlesTextureUtilityMethods.js";
import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import {
	failNativeGlesEnum,
	failNativeGlesOperation,
	nativeGlesTextureOutcome,
	nativeGlesTextureVisible,
	traceNativeGlesTexture
} from "./nativeGlesTextureStateSupport.js";
import { isNativeGlesTextureTarget, NATIVE_GLES_TEXTURE0 } from "./nativeGlesTextureTargets.js";

const STATES = new WeakMap();
const DEFAULT_MAX_TEXTURE_UNITS = 32;

/**
 * Owns share-group texture names, fixed object targets, bindings, and pixel state.
 * Object identity is exposed read-only for glIsTexture while mutations remain here.
 */
export function getNativeGlesTextureState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const domain = getNativeGlesQueryDomain(eglContextState);
	const contexts = createNativeGlesTextureContextStore();
	const records = new Map();
	let nextHandle = 1;
	const state = Object.freeze({
		active(textureValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const unit = Number(textureValue) - NATIVE_GLES_TEXTURE0;
			const maximum = runtimeState.nativeGlesMaxCombinedTextureUnits || DEFAULT_MAX_TEXTURE_UNITS;
			if (unit < 0 || unit >= maximum) return failNativeGlesEnum(domain, query.thread);
			contexts.setActiveUnit(query.context, unit);
			traceNativeGlesTexture(runtimeState, query.context, "active-texture", {
				texture: Number(textureValue),
				unit
			});
			return true;
		},
		bind(targetValue, handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const target = Number(targetValue);
			const handle = Number(handleValue);
			if (!isNativeGlesTextureTarget(target)) return failNativeGlesEnum(domain, query.thread);
			const record = handle === 0 ? null : records.get(handle);
			if (handle && !nativeGlesTextureVisible(record, eglContextState, query.context)) {
				return failNativeGlesOperation(domain, query.thread);
			}
			if (record?.target && record.target !== target) return failNativeGlesOperation(domain, query.thread);
			if (record && !record.target) record.target = target;
			contexts.bind(query.context, contexts.activeUnit(query.context), target, record);
			traceNativeGlesTexture(runtimeState, query.context, "bind-texture", { target, texture: handle });
			return true;
		},
		bound(targetValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return nativeGlesTextureOutcome(false, query.context, 0, null);
			const target = Number(targetValue);
			if (!isNativeGlesTextureTarget(target)) {
				domain.invalidEnum(query.thread);
				return nativeGlesTextureOutcome(false, query.context, 0, null);
			}
			const record = contexts.bound(query.context, contexts.activeUnit(query.context), target);
			return record
				? nativeGlesTextureOutcome(true, query.context, record.handle, record)
				: nativeGlesTextureOutcome(true, query.context, 0, Object.freeze({ handle: 0, target }));
		},
		delete(names, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			for (const raw of names) {
				const record = records.get(Number(raw));
				if (!nativeGlesTextureVisible(record, eglContextState, query.context)) continue;
				records.delete(record.handle);
				contexts.unbind(query.context, record);
				traceNativeGlesTexture(runtimeState, query.context, "delete-texture", { texture: record.handle });
			}
			return true;
		},
		domain,
		generate(count, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return Object.freeze({ names: [], success: false });
			const names = [];
			const shareRoot = nativeGlesShareRoot(eglContextState, query.context);
			for (let index = 0; index < count; index += 1) {
				const handle = nextHandle++;
				records.set(handle, { handle, shareRoot, target: null });
				names.push(handle);
				traceNativeGlesTexture(runtimeState, query.context, "create-texture", { texture: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		},
		...createNativeGlesTextureQueryMethods(records, domain, eglContextState),
		...createNativeGlesTextureUtilityMethods(runtimeState, domain, contexts)
	});
	STATES.set(runtimeState, state);
	return state;
}
