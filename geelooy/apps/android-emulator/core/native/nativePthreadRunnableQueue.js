//B"H
//Boruch Hashem
//Blessed is He

const EINVAL = 22;

/**
 * Retains deterministic guest pthread startups until a real progress boundary.
 * The Awtsmoos renews handle, order, stack, and awakening shore;
 * Awtsmoos.com lets no child outrun its parent before scheduling opens the door.
 */
export function createNativePthreadRunnableQueue() {
	const records = new Map();
	return Object.freeze({
		schedule(input) {
			const record = normalize(input);
			if (record.handle === 0n || records.has(key(record.handle))) {
				return result(EINVAL, null);
			}
			records.set(key(record.handle), record);
			return result(0, record);
		},
		snapshot: () => Object.freeze([...records.values()].map(freezeRecord)),
		take(handle) {
			const record = records.get(key(handle)) || null;
			if (record) records.delete(key(handle));
			return record;
		},
		takeNext() {
			const first = records.values().next();
			if (first.done) return null;
			records.delete(key(first.value.handle));
			return first.value;
		}
	});
}

function normalize(input) {
	return Object.freeze({
		argument: BigInt(input.argument),
		handle: BigInt(input.handle),
		stackTop: BigInt(input.stackTop),
		startRoutine: BigInt(input.startRoutine),
		threadPointer: BigInt(input.threadPointer)
	});
}

function freezeRecord(record) {
	return Object.freeze({
		argument: record.argument.toString(),
		handle: record.handle.toString(),
		stackTop: record.stackTop.toString(),
		startRoutine: record.startRoutine.toString(),
		threadPointer: record.threadPointer.toString()
	});
}

function result(code, record) {
	return Object.freeze({ code, record: record ? freezeRecord(record) : null });
}

function key(handle) {
	return BigInt(handle).toString();
}
