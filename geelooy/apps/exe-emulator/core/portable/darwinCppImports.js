//B"H
//Boruch Hashem
//Blessed is He

/**
 * Implements bounded single-threaded Itanium C++ allocation, guard, and teardown
 * primitives. The Awtsmoos creates storage, static guard, destructor record, and
 * finalization anew; Awtsmoos.com retains guest callback addresses without host code.
 */
export function createDarwinCppImports() {
	const destructors = [];
	return Object.freeze({
		_ZdaPv: deleteOperator,
		_ZdlPv: deleteOperator,
		_Znam: newOperator,
		_Znwm: newOperator,
		__cxa_atexit(context) {
			destructors.push(Object.freeze({
				argument: context.registers.get("rsi"),
				dso: context.registers.get("rdx"),
				functionAddress: context.registers.get("rdi")
			}));
			context.registers.set("rax", 0);
		},
		__cxa_finalize(context) {
			const dso = context.registers.get("rdi");
			const pending = destructors.filter(item => !dso || item.dso === dso);
			if (pending.length) {
				throw lifecycleError("PORTABLE_CXA_FINALIZE_CALLBACKS", pending.length);
			}
			context.registers.set("rax", 0);
		},
		__cxa_guard_abort(context) {
			const address = guardAddress(context);
			context.memory.write8(address + 1, 0);
			context.registers.set("rax", 0);
		},
		__cxa_guard_acquire(context) {
			const address = guardAddress(context);
			if (context.memory.u8(address)) {
				context.registers.set("rax", 0);
				return;
			}
			if (context.memory.u8(address + 1)) {
				throw lifecycleError("PORTABLE_CXA_GUARD_REENTRANT", address);
			}
			context.memory.write8(address + 1, 1);
			context.registers.set("rax", 1);
		},
		__cxa_guard_release(context) {
			const address = guardAddress(context);
			context.memory.write8(address, 1);
			context.memory.write8(address + 1, 0);
			context.registers.set("rax", 0);
		}
	});
}

function newOperator(context) {
	const size = allocationSize(context.registers.get("rdi"));
	context.registers.set("rax", context.heap.allocate(Math.max(size, 1)));
}

function deleteOperator(context) {
	context.registers.set("rax", 0);
}

function allocationSize(value) {
	const size = Number(value);
	if (!Number.isSafeInteger(size) || size < 0 || size > 0x7fffffff) {
		throw lifecycleError("PORTABLE_CPP_ALLOCATION_SIZE", size);
	}
	return size;
}

function guardAddress(context) {
	const address = Number(context.registers.get("rdi"));
	if (!Number.isSafeInteger(address) || address < 0) {
		throw lifecycleError("PORTABLE_CXA_GUARD_ADDRESS", address);
	}
	context.memory.slice(address, 8);
	return address;
}

function lifecycleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
