//B"H
//Boruch Hashem
//Blessed is He

const EINVAL = 22;
const ENOENT = 2;

/**
 * Registers Bionic system and auxiliary queries over explicit guest testimony.
 * The Awtsmoos renews query, result, errno, and X30 road with measured grace;
 * Awtsmoos.com leaks no host CPU, page, memory, or capability face.
 */
export function registerNativeLibcSystemHandlers(registry, options) {
	registry.register("sysconf", context => handleSysconf(context, options));
	registry.register("getpagesize", context => handleGetpagesize(context, options));
	registry.register("getauxval", context => handleGetauxval(context, options));
}

function handleSysconf(context, options) {
	const name = Number(BigInt.asIntN(32, context.registers.read(0, 32, "zero")));
	const query = options.state.query(name);
	const value = query.known ? query.value : -1n;
	if (!query.known) setErrno(context, options.errnoState, EINVAL);
	writeAndResume(context, BigInt.asUintN(64, value), 64);
	return Object.freeze({
		errno: query.known ? 0 : EINVAL,
		known: query.known,
		name,
		operation: "sysconf",
		value: value.toString()
	});
}

function handleGetpagesize(context, options) {
	const value = options.state.pageSize();
	writeAndResume(context, value, 32);
	return Object.freeze({ operation: "getpagesize", value: value.toString() });
}

function handleGetauxval(context, options) {
	const type = context.registers.read(0, 64, "zero");
	const query = options.state.queryAuxiliary(type);
	if (!query.known) setErrno(context, options.errnoState, ENOENT);
	writeAndResume(context, query.value, 64);
	return Object.freeze({
		errno: query.known ? 0 : ENOENT,
		known: query.known,
		operation: "getauxval",
		type: type.toString(),
		value: query.value.toString()
	});
}

function writeAndResume(context, value, width) {
	context.registers.write(0, value, width, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
}

function setErrno(context, errnoState, value) {
	if (!errnoState) return;
	try {
		errnoState.set(context.systemRegisters?.read("TPIDR_EL0") || 0n, value);
	} catch {
		errnoState.set(0n, value);
	}
}
