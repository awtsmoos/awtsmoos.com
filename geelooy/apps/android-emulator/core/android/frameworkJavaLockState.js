//B"H
//Boruch Hashem
//Blessed is He

import {
	currentGuestThread,
	guestThreadState
} from "./frameworkJavaThreadState.js";

const LOCK_STATE_FIELD = "java:lock:state";
const CHILD_PARENT_FIELD = "java:lock:parent";
const CHILD_MODE_FIELD = "java:lock:mode";
const PERMIT_FIELD = "java:lock-support:permit";

/**
 * Stores reentrant guest lock ownership beneath opaque references. The Awtsmoos
 * creates owner, read depth, write depth, and permit anew; Awtsmoos.com models one
 * deterministic guest lane and never blocks, parks, or wakes a host thread.
 */
export function initializeGuestLock(runtime, reference) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, LOCK_STATE_FIELD, {
		ownerId: null,
		readDepth: 0,
		writeDepth: 0
	});
}

export function createGuestLockChild(runtime, type, parent, mode) {
	return runtime.heap.allocate(type, {
		[CHILD_MODE_FIELD]: mode,
		[CHILD_PARENT_FIELD]: parent
	});
}

export function acquireGuestLock(runtime, reference) {
	const target = lockTarget(runtime, reference);
	const state = lockState(runtime, target.parent);
	const threadId = currentThreadId(runtime);
	if (target.mode === "read") {
		if (state.ownerId !== null && state.ownerId !== threadId) {
			throw lockStateError("ANDROID_LOCK_CONTENDED", "read");
		}
		state.readDepth += 1;
		return;
	}
	if (state.ownerId !== null && state.ownerId !== threadId) {
		throw lockStateError("ANDROID_LOCK_CONTENDED", "write");
	}
	state.ownerId = threadId;
	state.writeDepth += 1;
}

export function releaseGuestLock(runtime, reference) {
	const target = lockTarget(runtime, reference);
	const state = lockState(runtime, target.parent);
	const threadId = currentThreadId(runtime);
	if (target.mode === "read") {
		if (state.readDepth < 1) {
			throw lockStateError("ANDROID_LOCK_NOT_HELD", "read");
		}
		state.readDepth -= 1;
		return;
	}
	if (state.ownerId !== threadId || state.writeDepth < 1) {
		throw lockStateError("ANDROID_LOCK_NOT_HELD", "write");
	}
	state.writeDepth -= 1;
	if (state.writeDepth === 0) state.ownerId = null;
}

export function grantGuestParkPermit(runtime, thread) {
	if (!thread?.id) return;
	runtime.heap.setField(thread, PERMIT_FIELD, true);
}

export function consumeGuestParkPermit(runtime, thread = null) {
	const selected = thread?.id ? thread : currentGuestThread(runtime);
	const available = Boolean(runtime.heap.getField(selected, PERMIT_FIELD));
	if (available) runtime.heap.setField(selected, PERMIT_FIELD, false);
	return available;
}

function lockTarget(runtime, reference) {
	const parent = runtime.heap.getField(reference, CHILD_PARENT_FIELD);
	if (parent?.id) {
		return {
			mode: runtime.heap.getField(reference, CHILD_MODE_FIELD),
			parent
		};
	}
	return { mode: "write", parent: reference };
}

function lockState(runtime, reference) {
	const state = runtime.heap.getField(reference, LOCK_STATE_FIELD);
	if (!state) throw lockStateError("ANDROID_LOCK_UNINITIALIZED");
	return state;
}

function currentThreadId(runtime) {
	return guestThreadState(runtime, currentGuestThread(runtime)).id;
}

function lockStateError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
