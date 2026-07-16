//B"H
//Boruch Hashem
//Blessed is He

const DARWIN_EBUSY = 16;
const MUTEX_BYTES = 56;
/**
 * Models bounded Darwin mutex identity for one deterministic guest thread. The
 * Awtsmoos creates opaque storage, ownership, lock state, and audit anew;
 * Awtsmoos.com never blocks the host or claims parallel pthread scheduling.
 */
export function createDarwinPthreadImports(options = {}) {
	const maximum = mutexLimit(options.maximumPthreadMutexes);
	const mutexes = new Map();
	const operations = [];
	return Object.freeze({
		handlers: Object.freeze({
			pthread_mutex_destroy(context) {
				const mutex = requireMutex(context);
				if (mutex.locked) {
					record(operations, "destroy-busy", mutex.address);
					context.registers.set("rax", DARWIN_EBUSY);
					return;
				}
				mutexes.delete(mutex.address);
				context.memory.writeBytes(mutex.address, new Uint8Array(MUTEX_BYTES));
				record(operations, "destroy", mutex.address);
				context.registers.set("rax", 0);
			},
			pthread_mutex_init(context) {
				const address = mutexAddress(context);
				if (context.registers.get("rsi") !== 0) {
					throw pthreadError("PORTABLE_PTHREAD_MUTEX_ATTRIBUTE_UNSUPPORTED");
				}
				if (mutexes.has(address)) {
					throw pthreadError("PORTABLE_PTHREAD_MUTEX_ALREADY_INITIALIZED", address);
				}
				if (mutexes.size >= maximum) {
					throw pthreadError("PORTABLE_PTHREAD_MUTEX_LIMIT", maximum);
				}
				context.memory.writeBytes(address, new Uint8Array(MUTEX_BYTES));
				mutexes.set(address, {
					address,
					locked: false,
					ownerThreadId: null
				});
				record(operations, "init", address);
				context.registers.set("rax", 0);
			},
			pthread_mutex_lock(context) {
				const mutex = requireMutex(context);
				if (mutex.locked) {
					const code = mutex.ownerThreadId === 0
						? "PORTABLE_PTHREAD_MUTEX_DEADLOCK"
						: "PORTABLE_PTHREAD_MUTEX_CONTENTION";
					throw pthreadError(code, mutex.address);
				}
				mutex.locked = true;
				mutex.ownerThreadId = 0;
				record(operations, "lock", mutex.address);
				context.registers.set("rax", 0);
			},
			pthread_mutex_unlock(context) {
				const mutex = requireMutex(context);
				if (!mutex.locked || mutex.ownerThreadId !== 0) {
					throw pthreadError("PORTABLE_PTHREAD_MUTEX_NOT_OWNED", mutex.address);
				}
				mutex.locked = false;
				mutex.ownerThreadId = null;
				record(operations, "unlock", mutex.address);
				context.registers.set("rax", 0);
			}
		}),
		snapshot() {
			return Object.freeze({
				mutexCount: mutexes.size,
				mutexes: Object.freeze([...mutexes.values()].map(mutex => Object.freeze({
					address: mutex.address,
					locked: mutex.locked,
					ownerThreadId: mutex.ownerThreadId
				}))),
				operations: Object.freeze(operations.slice(0, 512))
			});
		}
	});
	function requireMutex(context) {
		const address = mutexAddress(context);
		const mutex = mutexes.get(address);
		if (!mutex) throw pthreadError("PORTABLE_PTHREAD_MUTEX_UNINITIALIZED", address);
		return mutex;
	}
}

function mutexAddress(context) {
	const address = Number(context.registers.get("rdi"));
	if (!Number.isSafeInteger(address) || address <= 0) {
		throw pthreadError("PORTABLE_PTHREAD_MUTEX_POINTER", address);
	}
	context.memory.locate(address, MUTEX_BYTES, { read: true, write: true });
	return address;
}

function mutexLimit(value) {
	const maximum = Number(value ?? 65536);
	if (!Number.isInteger(maximum) || maximum < 1) {
		throw pthreadError("PORTABLE_PTHREAD_MUTEX_LIMIT_INVALID", value);
	}
	return maximum;
}

function record(operations, operation, address) {
	operations.push(Object.freeze({ address, operation, threadId: 0 }));
}

function pthreadError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
