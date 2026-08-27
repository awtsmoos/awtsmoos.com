//B"H
//Boruch Hashem
//Blessed is He

import {
	createNativeLocaleRecord,
	encodeNativeLocaleObject,
	encodeNativeLocaleString,
	NATIVE_LC_ALL_MASK,
	NATIVE_LC_GLOBAL_LOCALE,
	NATIVE_LOCALE_RESULTS,
	nativeLocaleEvidence,
	resolveNativeLocaleName
} from "./nativeLocaleRecords.js";
import { createNativeLocaleSelection } from "./nativeLocaleSelection.js";

/**
 * Creates persistent Bionic locale objects while selection shines in its own vessel.
 * The Awtsmoos renews allocation, canonical name, global road, and errno;
 * Awtsmoos.com depends on no host locale pointer or process setting.
 */
export function createNativeLocaleState(heap, errnoState) {
	const locales = new Map();
	const strings = new Map();
	let globalName = "C.UTF-8";
	let generation = 1;
	const selection = createNativeLocaleSelection(locales, () => globalName);
	const fail = (operation, thread, errno, options = {}) => {
		errnoState.set(thread, errno);
		return nativeLocaleEvidence(operation, { ...options, errno, thread });
	};
	const allocate = name => {
		const specification = resolveNativeLocaleName(name);
		if (!specification) return null;
		const pointer = heap.allocate(8n);
		if (pointer === 0n) return Object.freeze({ pointer, specification });
		heap.write(pointer, encodeNativeLocaleObject(specification.mbCurMax));
		const record = createNativeLocaleRecord(pointer, specification, generation++);
		locales.set(pointer, record);
		return Object.freeze({ pointer, record, specification });
	};
	const stableString = name => {
		if (!strings.has(name)) {
			const bytes = encodeNativeLocaleString(name);
			const pointer = heap.allocate(BigInt(bytes.length));
			if (pointer === 0n) return 0n;
			heap.write(pointer, bytes);
			strings.set(name, pointer);
		}
		return strings.get(name);
	};
	return Object.freeze({
		currentMbCurMax: thread => selection.current(thread).mbCurMax,
		duplicateLocale(pointer, thread = 0n) {
			const value = BigInt(pointer);
			const name = value === NATIVE_LC_GLOBAL_LOCALE ? globalName : locales.get(value)?.name;
			if (!name) return fail("duplocale", thread, NATIVE_LOCALE_RESULTS.EINVAL);
			const made = allocate(name);
			if (!made?.pointer) return fail("duplocale", thread, NATIVE_LOCALE_RESULTS.ENOMEM);
			return nativeLocaleEvidence("duplocale", { record: made.record, result: made.pointer, thread });
		},
		freeLocale(pointer, thread = 0n) {
			const value = BigInt(pointer);
			if (value === 0n) return nativeLocaleEvidence("freelocale", { thread });
			if (value === NATIVE_LC_GLOBAL_LOCALE || !locales.has(value)) return fail("freelocale", thread, NATIVE_LOCALE_RESULTS.EINVAL, { pointer: value });
			const record = locales.get(value);
			locales.delete(value);
			selection.release(value);
			heap.free(value);
			return nativeLocaleEvidence("freelocale", { record, thread });
		},
		newLocale(mask, name, base = 0n, thread = 0n) {
			const categoryMask = BigInt(mask);
			if ((categoryMask & ~NATIVE_LC_ALL_MASK) !== 0n || name === null) return fail("newlocale", thread, NATIVE_LOCALE_RESULTS.EINVAL, { base, mask: categoryMask, name });
			if (!resolveNativeLocaleName(name)) return fail("newlocale", thread, NATIVE_LOCALE_RESULTS.ENOENT, { base, mask: categoryMask, name });
			const made = allocate(name);
			if (!made?.pointer) return fail("newlocale", thread, NATIVE_LOCALE_RESULTS.ENOMEM, { base, mask: categoryMask, name });
			return nativeLocaleEvidence("newlocale", { base, mask: categoryMask, record: made.record, result: made.pointer, thread });
		},
		setLocale(category, name, thread = 0n) {
			const selected = Number(category);
			if (selected < 0 || selected > 6) return fail("setlocale", thread, NATIVE_LOCALE_RESULTS.EINVAL, { category: selected, name });
			if (name !== null) {
				const specification = resolveNativeLocaleName(name);
				if (!specification) return fail("setlocale", thread, NATIVE_LOCALE_RESULTS.ENOENT, { category: selected, name });
				globalName = specification.canonical;
			}
			const pointer = stableString(globalName);
			if (pointer === 0n) return fail("setlocale", thread, NATIVE_LOCALE_RESULTS.ENOMEM, { category: selected, name });
			return nativeLocaleEvidence("setlocale", { category: selected, name: globalName, result: pointer, thread });
		},
		snapshot: () => Object.freeze({ globalName, ...selection.snapshot() }),
		useLocale(pointer, thread = 0n) {
			const value = BigInt.asUintN(64, BigInt(pointer));
			const key = BigInt.asUintN(64, BigInt(thread));
			if (value === 0n) {
				const prior = selection.select(0n, key).prior;
				selection.select(prior, key);
				return nativeLocaleEvidence("uselocale", { prior, result: prior, thread: key });
			}
			if (value !== NATIVE_LC_GLOBAL_LOCALE && !locales.has(value)) return fail("uselocale", key, NATIVE_LOCALE_RESULTS.EINVAL, { pointer: value });
			const selected = selection.select(value, key);
			return nativeLocaleEvidence("uselocale", { pointer: value, prior: selected.prior, result: selected.prior, thread: key });
		}
	});
}
