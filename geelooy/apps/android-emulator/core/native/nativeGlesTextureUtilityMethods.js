//B"H
//Boruch Hashem
//Blessed be He

import {
	failNativeGlesEnum,
	failNativeGlesValue,
	nativeGlesPixelStoreEntry,
	traceNativeGlesTexture
} from "./nativeGlesTextureStateSupport.js";

/**
 * Builds texture utilities that do not own texture object identity.
 * Pixel-store state remains context-local while tracing remains runtime-owned,
 * allowing the primary texture state to stay below the project size limit.
 */
export function createNativeGlesTextureUtilityMethods(runtimeState, domain, contexts) {
	return Object.freeze({
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
			if (entry[1] ? ![1, 2, 4, 8].includes(param) : param < 0) {
				return failNativeGlesValue(domain, query.thread);
			}
			contexts.setPixelStore(query.context, entry[0], param);
			traceNativeGlesTexture(runtimeState, query.context, "pixel-store", {
				param,
				pname: Number(pnameValue)
			});
			return true;
		},
		record(context, kind, payload) {
			traceNativeGlesTexture(runtimeState, context, kind, payload);
		}
	});
}
