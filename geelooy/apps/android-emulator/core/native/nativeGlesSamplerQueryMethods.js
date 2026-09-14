//B"H
//Boruch Hashem
//Blessed be He

import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";

const DEFAULTS = new Map([
	[0x2800, 0x2601],
	[0x2801, 0x2702],
	[0x2802, 0x2901],
	[0x2803, 0x2901],
	[0x8072, 0x2901],
	[0x884c, 0],
	[0x884d, 0x0203]
]);

/** Adds read-only sampler identity and parameter queries to the shared sampler ledger. */
export function createNativeGlesSamplerQueryMethods(records, domain, eglContextState) {
	return Object.freeze({
		is(handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const record = records.get(Number(handleValue));
			return visible(record, eglContextState, query.context);
		},
		query(handleValue, pnameValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return failed();
			const record = records.get(Number(handleValue));
			if (!visible(record, eglContextState, query.context)) {
				domain.invalidOperation(query.thread);
				return failed();
			}
			const pname = Number(pnameValue);
			const value = record.params.has(pname)
				? record.params.get(pname)
				: DEFAULTS.get(pname);
			if (value === undefined) {
				domain.invalidEnum(query.thread);
				return failed();
			}
			return Object.freeze({ success: true, value });
		}
	});
}

function visible(record, eglContextState, context) {
	return Boolean(record)
		&& record.shareRoot === nativeGlesShareRoot(eglContextState, context);
}

function failed() {
	return Object.freeze({ success: false, value: 0 });
}
