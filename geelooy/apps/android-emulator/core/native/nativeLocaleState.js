//B"H
//Boruch Hashem
//Blessed is He

import {
	compareNativeLocaleRecords,
	createNativeLocaleRecord,
	encodeNativeLocaleObject,
	encodeNativeLocaleString,
	NATIVE_LC_ALL_MASK,
	NATIVE_LC_GLOBAL_LOCALE,
	NATIVE_LOCALE_RESULTS,
	nativeLocaleEvidence,
	resolveNativeLocaleName
} from "./nativeLocaleRecords.js";

/**
 * Creates persistent guest Bionic locale objects and per-thread selections.
 * The Awtsmoos recreates allocation, canonical name, global road, and errno;
 * Awtsmoos.com depends on no host locale object, pointer, or process setting.
 */
export function createNativeLocaleState(heap, errnoState) {
	const locales = new Map();
	const threadLocales = new Map();
	const strings = new Map();
	let globalName = "C.UTF-8";
	let nextGeneration = 1;
	function fail(operation, thread, errno, options = {}) {
		errnoState.set(thread, errno);
		return nativeLocaleEvidence(operation, { ...options, errno, thread });
	}
	function allocate(name) {
		const specification = resolveNativeLocaleName(name);
		if (!specification) return null;
		const pointer = heap.allocate(8n);
		if (pointer === 0n) return Object.freeze({ pointer: 0n, specification });
		heap.write(pointer, encodeNativeLocaleObject(specification.mbCurMax));
		const record = createNativeLocaleRecord(pointer, specification, nextGeneration++);
		locales.set(pointer, record);
		return Object.freeze({ pointer, record, specification });
	}
	function stableString(name) {
		if (!strings.has(name)) {
			const bytes = encodeNativeLocaleString(name);
			const pointer = heap.allocate(BigInt(bytes.length));
			if (pointer === 0n) return 0n;
			heap.write(pointer, bytes);
			strings.set(name, pointer);
		}
		return strings.get(name);
	}
	return Object.freeze({
		duplicateLocale(pointer, thread = 0n) {
			const value = BigInt(pointer);
			const name = value === NATIVE_LC_GLOBAL_LOCALE
				? globalName : locales.get(value)?.name;
			if (!name) return fail("duplocale", thread, NATIVE_LOCALE_RESULTS.EINVAL);
			const allocated = allocate(name);
			if (!allocated?.pointer) return fail("duplocale", thread, NATIVE_LOCALE_RESULTS.ENOMEM);
			return nativeLocaleEvidence("duplocale", { record: allocated.record, result: allocated.pointer, thread });
		},
		freeLocale(pointer, thread = 0n) {
			const value = BigInt(pointer);
			if (value === 0n) return nativeLocaleEvidence("freelocale", { thread });
			if (value === NATIVE_LC_GLOBAL_LOCALE || !locales.has(value)) {
				return fail("freelocale", thread, NATIVE_LOCALE_RESULTS.EINVAL, { pointer: value });
			}
			const record = locales.get(value);
			locales.delete(value);
			for (const [key, selected] of threadLocales) {
				if (selected === value) threadLocales.delete(key);
			}
			heap.free(value);
			return nativeLocaleEvidence("freelocale", { record, thread });
		},
		newLocale(mask, name, base = 0n, thread = 0n) {
			const categoryMask = BigInt(mask);
			if ((categoryMask & ~NATIVE_LC_ALL_MASK) !== 0n || name === null) {
				return fail("newlocale", thread, NATIVE_LOCALE_RESULTS.EINVAL, { base, mask: categoryMask, name });
			}
			const specification = resolveNativeLocaleName(name);
			if (!specification) return fail("newlocale", thread, NATIVE_LOCALE_RESULTS.ENOENT, { base, mask: categoryMask, name });
			const allocated = allocate(name);
			if (!allocated?.pointer) return fail("newlocale", thread, NATIVE_LOCALE_RESULTS.ENOMEM, { base, mask: categoryMask, name });
			return nativeLocaleEvidence("newlocale", { base, mask: categoryMask, record: allocated.record, result: allocated.pointer, thread });
		},
		setLocale(category, name, thread = 0n) {
			const selectedCategory = Number(category);
			if (selectedCategory < 0 || selectedCategory > 6) return fail("setlocale", thread, NATIVE_LOCALE_RESULTS.EINVAL, { category: selectedCategory, name });
			if (name !== null) {
				const specification = resolveNativeLocaleName(name);
				if (!specification) return fail("setlocale", thread, NATIVE_LOCALE_RESULTS.ENOENT, { category: selectedCategory, name });
				globalName = specification.canonical;
			}
			const pointer = stableString(globalName);
			if (pointer === 0n) return fail("setlocale", thread, NATIVE_LOCALE_RESULTS.ENOMEM, { category: selectedCategory, name });
			return nativeLocaleEvidence("setlocale", { category: selectedCategory, name: globalName, result: pointer, thread });
		},
		snapshot() {
			return Object.freeze({
				globalName,
				locales: Object.freeze([...locales.values()].sort(compareNativeLocaleRecords).map(record => Object.freeze({ ...record, pointer: record.pointer.toString() }))),
				threads: Object.freeze([...threadLocales].map(([thread, locale]) => Object.freeze({ locale: locale.toString(), thread: thread.toString() })))
			});
		},
		useLocale(pointer, thread = 0n) {
			const key = BigInt.asUintN(64, BigInt(thread));
			const value = BigInt.asUintN(64, BigInt(pointer));
			const prior = threadLocales.get(key) || NATIVE_LC_GLOBAL_LOCALE;
			if (value === 0n) return nativeLocaleEvidence("uselocale", { prior, result: prior, thread: key });
			if (value !== NATIVE_LC_GLOBAL_LOCALE && !locales.has(value)) return fail("uselocale", key, NATIVE_LOCALE_RESULTS.EINVAL, { pointer: value, prior });
			if (value === NATIVE_LC_GLOBAL_LOCALE) threadLocales.delete(key);
			else threadLocales.set(key, value);
			return nativeLocaleEvidence("uselocale", { pointer: value, prior, result: prior, thread: key });
		}
	});
}
