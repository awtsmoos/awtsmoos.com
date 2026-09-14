//B"H
//Boruch Hashem
//Blessed be He

import { nativeGlesTextureVisible } from "./nativeGlesTextureStateSupport.js";

/**
 * Exposes read-only texture identity queries without widening mutation authority.
 * A generated name becomes a GLES texture only after its first successful bind,
 * matching the lifecycle already represented by the record's fixed target.
 */
export function createNativeGlesTextureQueryMethods(records, domain, eglContextState) {
	return Object.freeze({
		is(handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const record = records.get(Number(handleValue));
			return Boolean(
				record?.target
				&& nativeGlesTextureVisible(record, eglContextState, query.context)
			);
		}
	});
}
