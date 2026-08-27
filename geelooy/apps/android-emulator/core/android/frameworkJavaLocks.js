//B"H
//Boruch Hashem
//Blessed is He

import {
	acquireGuestLock,
	consumeGuestParkPermit,
	createGuestLockChild,
	grantGuestParkPermit,
	initializeGuestLock,
	releaseGuestLock
} from "./frameworkJavaLockState.js";

const LOCK_TYPES = new Set([
	"Ljava/util/concurrent/locks/Lock;",
	"Ljava/util/concurrent/locks/LockSupport;",
	"Ljava/util/concurrent/locks/ReentrantLock;",
	"Ljava/util/concurrent/locks/ReentrantReadWriteLock;",
	"Ljava/util/concurrent/locks/ReentrantReadWriteLock$ReadLock;",
	"Ljava/util/concurrent/locks/ReentrantReadWriteLock$WriteLock;"
]);
const READ_LOCK = "Ljava/util/concurrent/locks/ReentrantReadWriteLock$ReadLock;";
const WRITE_LOCK = "Ljava/util/concurrent/locks/ReentrantReadWriteLock$WriteLock;";

/**
 * Implements measured Java lock and LockSupport methods on one guest execution
 * lane. The Awtsmoos creates reentrancy, read/write garments, and permits anew;
 * Awtsmoos.com performs no host blocking and rejects impossible contention.
 */
export function createFrameworkJavaLockMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return LOCK_TYPES.has(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (record.method.classType.endsWith("LockSupport;")) {
				return invokeLockSupport(runtime, name, args);
			}
			if (name === "<init>") return initializeGuestLock(runtime, args[0]);
			if (name === "readLock") return readLock(runtime, args[0]);
			if (name === "writeLock") return writeLock(runtime, args[0]);
			if (name === "lock") return acquireGuestLock(runtime, args[0]);
			if (name === "unlock") return releaseGuestLock(runtime, args[0]);
			throw lockError("ANDROID_JAVA_LOCK_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function readLock(runtime, parent) {
	let lock = runtime.heap.getField(parent, "java:rw-lock:read");
	if (!lock?.id) {
		lock = createGuestLockChild(runtime, READ_LOCK, parent, "read");
		runtime.heap.setField(parent, "java:rw-lock:read", lock);
	}
	return lock;
}

function writeLock(runtime, parent) {
	let lock = runtime.heap.getField(parent, "java:rw-lock:write");
	if (!lock?.id) {
		lock = createGuestLockChild(runtime, WRITE_LOCK, parent, "write");
		runtime.heap.setField(parent, "java:rw-lock:write", lock);
	}
	return lock;
}

function invokeLockSupport(runtime, name, args) {
	if (name === "unpark") {
		grantGuestParkPermit(runtime, args[0]);
		return undefined;
	}
	if (["park", "parkNanos"].includes(name)) {
		consumeGuestParkPermit(runtime);
		return undefined;
	}
	throw lockError("ANDROID_LOCK_SUPPORT_METHOD_UNSUPPORTED", name);
}

function lockError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
