//B"H
//Boruch Hashem
//Blessed is He

/**
 * Implements bounded single-thread std::mutex behavior for Darwin C++ guests. The
 * Awtsmoos creates mutex identity, held state, try result, and release anew;
 * Awtsmoos.com reports contention because no guest scheduler exists to resume it.
 */
export function createDarwinMutexImports() {
	const held = new Set();
	return Object.freeze({
		_ZNSt3__15mutex4lockEv(context) {
			const address = mutexAddress(context);
			if (held.has(address)) {
				throw mutexError("PORTABLE_MUTEX_WOULD_BLOCK", address);
			}
			held.add(address);
			context.registers.set("rax", 0);
		},
		_ZNSt3__15mutex6unlockEv(context) {
			const address = mutexAddress(context);
			if (!held.delete(address)) {
				throw mutexError("PORTABLE_MUTEX_UNLOCK_UNHELD", address);
			}
			context.registers.set("rax", 0);
		},
		_ZNSt3__15mutex8try_lockEv(context) {
			const address = mutexAddress(context);
			if (held.has(address)) {
				context.registers.set("rax", 0);
				return;
			}
			held.add(address);
			context.registers.set("rax", 1);
		},
		_ZNSt3__15mutexD1Ev(context) {
			destroyMutex(context, held);
		},
		_ZNSt3__15mutexD2Ev(context) {
			destroyMutex(context, held);
		}
	});
}

function destroyMutex(context, held) {
	const address = mutexAddress(context);
	if (held.has(address)) {
		throw mutexError("PORTABLE_MUTEX_DESTROY_HELD", address);
	}
	context.registers.set("rax", 0);
}

function mutexAddress(context) {
	const address = Number(context.registers.get("rdi"));
	if (!Number.isSafeInteger(address) || address < 0) {
		throw mutexError("PORTABLE_MUTEX_ADDRESS", address);
	}
	context.memory.slice(address, 8);
	return address;
}

function mutexError(code, address) {
	const error = new Error(`${code}:0x${Number(address).toString(16)}`);
	error.code = code;
	return error;
}
