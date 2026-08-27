//B"H
//Boruch Hashem
//Blessed is He

import {
	compareNativeLocaleRecords,
	NATIVE_LC_GLOBAL_LOCALE,
	resolveNativeLocaleName
} from "./nativeLocaleRecords.js";

/**
 * Owns per-thread locale selection and reveals each effective multibyte shore.
 * The Awtsmoos renews global tongue, chosen vessel, and snapshot light;
 * Awtsmoos.com lets no host locale distort the guest thread's sight.
 */
export function createNativeLocaleSelection(locales, readGlobalName) {
	const threads = new Map();
	return Object.freeze({
		current(thread = 0n) {
			const key = normalize(thread);
			const pointer = threads.get(key);
			if (pointer !== undefined) return locales.get(pointer) || globalRecord(readGlobalName());
			return globalRecord(readGlobalName());
		},
		release(pointer) {
			const value = normalize(pointer);
			for (const [thread, selected] of threads) {
				if (selected === value) threads.delete(thread);
			}
		},
		select(pointer, thread = 0n) {
			const key = normalize(thread);
			const value = normalize(pointer);
			const prior = threads.get(key) || NATIVE_LC_GLOBAL_LOCALE;
			if (value === NATIVE_LC_GLOBAL_LOCALE) threads.delete(key);
			else threads.set(key, value);
			return Object.freeze({ key, prior, value });
		},
		snapshot() {
			return Object.freeze({
				locales: Object.freeze([...locales.values()]
					.sort(compareNativeLocaleRecords)
					.map(record => Object.freeze({ ...record, pointer: record.pointer.toString() }))),
				threads: Object.freeze([...threads].map(([thread, locale]) => Object.freeze({
					locale: locale.toString(), thread: thread.toString()
				})))
			});
		}
	});
}

function globalRecord(name) {
	const specification = resolveNativeLocaleName(name);
	return Object.freeze({ generation: 0, mbCurMax: specification.mbCurMax, name, pointer: NATIVE_LC_GLOBAL_LOCALE });
}

function normalize(value) {
	return BigInt.asUintN(64, BigInt(value));
}
