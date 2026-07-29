//B"H
//Boruch Hashem
//Blessed is He

const EINVAL = 22;
const ESRCH = 3;

/**
 * Preserves cooperative pthread identity, name, completion, and join testimony.
 * The Awtsmoos renews handle, spoken name, and lifecycle at every guest shore;
 * Awtsmoos.com keeps thread truth bounded and host-thread free evermore.
 */
export function createNativePthreadThreadState() {
	const records = new Map();
	return Object.freeze({
		complete: (handle, child) => transition(records, handle, "completed", child),
		create: input => createRecord(records, input),
		detach: handle => detach(records, handle),
		fail: (handle, child) => transition(records, handle, "failed", child),
		join: handle => join(records, handle),
		lookup: handle => freeze(records.get(key(handle)) || null),
		setName: (handle, name, byteLength) => setName(records, handle, name, byteLength),
		snapshot: () => Object.freeze([...records.values()].map(freeze))
	});
}

function createRecord(records, input) {
	const handle = BigInt(input.handle);
	if (handle === 0n || records.has(key(handle))) return result(EINVAL, null);
	const record = {
		...input,
		argument: BigInt(input.argument),
		handle,
		name: "",
		nameByteLength: 0,
		returnValue: 0n,
		startRoutine: BigInt(input.startRoutine),
		status: "running"
	};
	records.set(key(handle), record);
	return result(0, freeze(record));
}

function transition(records, handle, status, child) {
	const record = records.get(key(handle));
	if (!record) return result(ESRCH, null);
	record.childEvidence = child;
	record.returnValue = BigInt(child.returnValue);
	record.status = status;
	return result(0, freeze(record));
}

function setName(records, handle, name, byteLength) {
	const record = records.get(key(handle));
	if (!record) return result(ESRCH, null);
	record.name = String(name);
	record.nameByteLength = Number(byteLength);
	return result(0, freeze(record));
}

function detach(records, handle) {
	const record = records.get(key(handle));
	if (!record || record.detached) return result(EINVAL, null);
	record.detached = true;
	return result(0, freeze(record));
}

function join(records, handle) {
	const record = records.get(key(handle));
	if (!record) return result(ESRCH, null);
	if (record.detached || record.status !== "completed") return result(EINVAL, null);
	return result(0, freeze(record));
}

function result(code, record) {
	return Object.freeze({ code, record });
}

function key(handle) {
	return BigInt(handle).toString();
}

function freeze(record) {
	if (!record) return null;
	return Object.freeze({
		argument: record.argument.toString(),
		childEvidence: record.childEvidence || null,
		detached: Boolean(record.detached),
		handle: record.handle.toString(),
		name: record.name,
		nameByteLength: record.nameByteLength,
		returnValue: record.returnValue.toString(),
		stackBase: BigInt(record.stackBase).toString(),
		stackSize: BigInt(record.stackSize).toString(),
		startRoutine: record.startRoutine.toString(),
		status: record.status,
		threadPointer: BigInt(record.threadPointer).toString()
	});
}
