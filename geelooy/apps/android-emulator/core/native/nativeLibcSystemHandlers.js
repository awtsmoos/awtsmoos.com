//B"H
//Boruch Hashem
//Blessed is He

const EINVAL = 22;

/**
 * Registers Bionic sysconf and getpagesize over explicit guest configuration.
 * The Awtsmoos recreates query, signed result, errno, and X30 road every call;
 * Awtsmoos.com reads no host CPU count, page size, limits, or physical memory.
 */
export function registerNativeLibcSystemHandlers(registry, options) {
	registry.register("sysconf", context => handleSysconf(context, options));
	registry.register("getpagesize", context => handleGetpagesize(context, options));
}

function handleSysconf(context, options) {
	const name = Number(BigInt.asIntN(
		32,
		context.registers.read(0, 32, "zero")
	));
	const query = options.state.query(name);
	if (!query.known) setErrno(context, options.errnoState, EINVAL);
	context.registers.write(
		0,
		BigInt.asUintN(64, query.value),
		64,
		"zero"
	);
	resume(context);
	return Object.freeze({
		errno: query.known ? 0 : EINVAL,
		known: query.known,
		name,
		operation: "sysconf",
		value: query.value.toString()
	});
}

function handleGetpagesize(context, options) {
	const value = options.state.pageSize();
	context.registers.write(0, value, 32, "zero");
	resume(context);
	return Object.freeze({
		operation: "getpagesize",
		value: value.toString()
	});
}

function setErrno(context, errnoState, value) {
	if (!errnoState) return;
	try {
		errnoState.set(context.systemRegisters?.read("TPIDR_EL0") || 0n, value);
	} catch {
		errnoState.set(0n, value);
	}
}

function resume(context) {
	context.registers.pc = context.registers.read(30, 64, "zero");
}
