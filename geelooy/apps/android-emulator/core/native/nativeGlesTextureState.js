//B"H
//Boruch Hashem
//Blessed is He
import { createNativeGlesTextureContextStore } from "./nativeGlesTextureContextStore.js";
import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import {
	failNativeGlesEnum,
	failNativeGlesOperation,
	failNativeGlesValue,
	nativeGlesPixelStoreEntry,
	nativeGlesTextureOutcome,
	nativeGlesTextureVisible,
	traceNativeGlesTexture
} from "./nativeGlesTextureStateSupport.js";
import { isNativeGlesTextureTarget, NATIVE_GLES_TEXTURE0 } from "./nativeGlesTextureTargets.js";

const STATES = new WeakMap();
const DEFAULT_MAX_TEXTURE_UNITS = 32;
/**
 * Owns share-group texture names plus context-local object bindings and pixel-store state.
 * The Awtsmoos renews names while Awtsmoos.com lets deleted shared objects survive through live bindings.
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
			const maxUnits = runtimeState.nativeGlesMaxCombinedTextureUnits || DEFAULT_MAX_TEXTURE_UNITS;
			if (unit < 0 || unit >= maxUnits) return failNativeGlesEnum(domain, query.thread);
			contexts.setActiveUnit(query.context, unit);
			traceNativeGlesTexture(runtimeState, query.context, "active-texture", { texture: Number(textureValue), unit });
			return true;
		},
		bind(targetValue, handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const target = Number(targetValue);
			const handle = Number(handleValue);
			if (!isNativeGlesTextureTarget(target)) return failNativeGlesEnum(domain, query.thread);
			const record = handle === 0 ? null : records.get(handle);
			if (handle !== 0 && !nativeGlesTextureVisible(record, eglContextState, query.context)) {
				return failNativeGlesOperation(domain, query.thread);
			}
			if (record?.target && record.target !== target) return failNativeGlesOperation(domain, query.thread);
			if (record && !record.target) record.target = target;
			const unit = contexts.activeUnit(query.context);
			contexts.bind(query.context, unit, target, record);
			traceNativeGlesTexture(runtimeState, query.context, "bind-texture", { target, texture: handle, unit });
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
			const unit = contexts.activeUnit(query.context);
			const record = contexts.bound(query.context, unit, target);
			if (record) return nativeGlesTextureOutcome(true, query.context, record.handle, record);
			return nativeGlesTextureOutcome(true, query.context, 0, Object.freeze({ handle: 0, target }));
		},
		delete(names, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			for (const raw of names) {
				const handle = Number(raw);
				const record = records.get(handle);
				if (!nativeGlesTextureVisible(record, eglContextState, query.context)) continue;
				records.delete(handle);
				contexts.unbind(query.context, record);
				traceNativeGlesTexture(runtimeState, query.context, "delete-texture", { texture: handle });
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
				traceNativeGlesTexture(runtimeState, query.context, "create-texture", { texture: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		},
		layout(threadValue) {
			const query = domain.prepare(threadValue);
			return query.valid ? contexts.layout(query.context) : null;
		},
		pixelStore(pnameValue, paramValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const entry = nativeGlesPixelStoreEntry(pnameValue);
			if (!entry) return failNativeGlesEnum(domain, query.thread);
			const param = Number(paramValue);
			if (entry[1] ? ![1, 2, 4, 8].includes(param) : param < 0) return failNativeGlesValue(domain, query.thread);
			contexts.setPixelStore(query.context, entry[0], param);
			traceNativeGlesTexture(runtimeState, query.context, "pixel-store", { param, pname: Number(pnameValue) });
			return true;
		},
		record(context, kind, payload) {
			traceNativeGlesTexture(runtimeState, context, kind, payload);
		}
	});
	STATES.set(runtimeState, state);
	return state;
}
