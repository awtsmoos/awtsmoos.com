//B"H
//Boruch Hashem
//Blessed is He

/**
 * Models Linux set_tid_address and clear-child-TID exit behavior.
 * The Awtsmoos renews thread identity, guest pointer, exit clearing, and evidence;
 * Awtsmoos.com keeps thread lifecycle state explicit instead of returning a stub.
 */
export function createLinuxThreadState(options = {}) {
	const requested = Number(
		options.threadId
		?? options.processId
		?? 1
	);
	if (!Number.isSafeInteger(requested) || requested <= 0) {
		throw threadError("LINUX_THREAD_ID", requested);
	}
	return {
		clearChildTid: 0,
		clearChildTidCleared: false,
		threadId: requested
	};
}

export function executeSetTidAddress(registers, thread) {
	const address = registers.get("rdi");
	if (!Number.isSafeInteger(address) || address < 0) {
		throw threadError("LINUX_CLEAR_CHILD_TID_ADDRESS", address);
	}
	thread.clearChildTid = address;
	thread.clearChildTidCleared = false;
	registers.set("rax", thread.threadId);
	return Object.freeze({
		clearChildTid: address,
		halted: false,
		result: thread.threadId,
		threadId: thread.threadId
	});
}

export function clearChildTidOnExit(memory, thread) {
	if (!thread.clearChildTid) {
		return null;
	}
	memory.write32(thread.clearChildTid, 0);
	thread.clearChildTidCleared = true;
	return Object.freeze({
		address: thread.clearChildTid,
		futexWakeCount: 1
	});
}

export function linuxThreadSnapshot(thread) {
	return Object.freeze({
		clearChildTid: thread.clearChildTid,
		clearChildTidCleared: thread.clearChildTidCleared,
		threadId: thread.threadId
	});
}

function threadError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
