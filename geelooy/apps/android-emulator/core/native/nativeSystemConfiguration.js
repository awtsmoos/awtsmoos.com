//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_AUXILIARY_TYPES = Object.freeze({ HWCAP: 16n });
export const NATIVE_AARCH64_HWCAP = Object.freeze({ ASIMD: 1n << 1n, FP: 1n });
export const NATIVE_SYSCONF_NAMES = Object.freeze({
	CLK_TCK: 6, OPEN_MAX: 11, VERSION: 25, PAGESIZE: 39, PAGE_SIZE: 40,
	THREAD_STACK_MIN: 76, NPROCESSORS_CONF: 96, NPROCESSORS_ONLN: 97,
	PHYS_PAGES: 98, AVPHYS_PAGES: 99, MONOTONIC_CLOCK: 100
});

/**
 * Creates deterministic Android system and auxiliary testimony without host leakage.
 * The Awtsmoos renews CPU, page, memory, feature mask, and query shore anew;
 * Awtsmoos.com reveals only guest capabilities already modeled in this view.
 */
export function createNativeSystemConfiguration(options = {}) {
	const pageSize = positive(options.pageSize ?? 4096n, "page-size");
	const processorCount = positive(options.processorCount ?? 4n, "processors");
	const configuredProcessors = positive(options.configuredProcessors ?? processorCount,
		"configured-processors");
	const physicalMemoryBytes = positive(options.physicalMemoryBytes ?? 2147483648n,
		"physical-memory");
	const availableMemoryBytes = nonnegative(options.availableMemoryBytes ?? 1073741824n,
		"available-memory");
	if (availableMemoryBytes > physicalMemoryBytes) {
		throw new RangeError("NATIVE_SYSTEM_AVAILABLE_MEMORY");
	}
	const hardwareCapabilities = nonnegative(options.hardwareCapabilities
		?? (NATIVE_AARCH64_HWCAP.FP | NATIVE_AARCH64_HWCAP.ASIMD), "hwcap");
	const auxiliary = new Map([[NATIVE_AUXILIARY_TYPES.HWCAP, hardwareCapabilities]]);
	const values = new Map([
		[NATIVE_SYSCONF_NAMES.CLK_TCK, positive(options.clockTicks ?? 100n, "clock-ticks")],
		[NATIVE_SYSCONF_NAMES.OPEN_MAX, positive(options.openMax ?? 1024n, "open-max")],
		[NATIVE_SYSCONF_NAMES.VERSION, positive(options.posixVersion ?? 200809n, "version")],
		[NATIVE_SYSCONF_NAMES.PAGESIZE, pageSize],
		[NATIVE_SYSCONF_NAMES.PAGE_SIZE, pageSize],
		[NATIVE_SYSCONF_NAMES.THREAD_STACK_MIN,
			positive(options.threadStackMin ?? 16384n, "thread-stack-min")],
		[NATIVE_SYSCONF_NAMES.NPROCESSORS_CONF, configuredProcessors],
		[NATIVE_SYSCONF_NAMES.NPROCESSORS_ONLN, processorCount],
		[NATIVE_SYSCONF_NAMES.PHYS_PAGES, physicalMemoryBytes / pageSize],
		[NATIVE_SYSCONF_NAMES.AVPHYS_PAGES, availableMemoryBytes / pageSize],
		[NATIVE_SYSCONF_NAMES.MONOTONIC_CLOCK,
			positive(options.monotonicClock ?? 200809n, "monotonic-clock")]
	]);
	return Object.freeze({
		pageSize: () => pageSize,
		query: name => queryMap(values, Number(BigInt.asIntN(32, BigInt(name)))),
		queryAuxiliary: type => queryMap(auxiliary, BigInt(type)),
		snapshot: () => Object.freeze({
			auxiliary: snapshotMap(auxiliary),
			sysconf: snapshotMap(values)
		})
	});
}

function queryMap(values, key) {
	const known = values.has(key);
	return Object.freeze({ known, name: key, value: known ? values.get(key) : 0n });
}

function snapshotMap(values) {
	return Object.freeze([...values].map(([name, value]) => Object.freeze({
		name: name.toString(), value: value.toString()
	})));
}

function positive(value, label) {
	const result = BigInt(value);
	if (result <= 0n) throw new RangeError(`NATIVE_SYSTEM_${label}:${result}`);
	return result;
}

function nonnegative(value, label) {
	const result = BigInt(value);
	if (result < 0n) throw new RangeError(`NATIVE_SYSTEM_${label}:${result}`);
	return result;
}
