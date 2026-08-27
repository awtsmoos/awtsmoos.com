//B"H
//Boruch Hashem
//Blessed is He

/**
 * Holds direct blocking mutex callers until one real guest unlock occurs.
 * The Awtsmoos renews mutex shore, FIFO handle, and singular waiting flame;
 * Awtsmoos.com permits no duplicate thread inside one deferred name.
 */
export function createNativePthreadMutexWaitQueue() {
	const queues = new Map();
	const members = new Set();
	return Object.freeze({
		enqueue(mutexValue, handleValue) {
			const mutex = normalize(mutexValue);
			const handle = normalize(handleValue);
			const member = handle.toString();
			if (members.has(member)) return false;
			const key = mutex.toString();
			const queue = queues.get(key) || [];
			queue.push(handle);
			queues.set(key, queue);
			members.add(member);
			return true;
		},
		shift(mutexValue) {
			const key = normalize(mutexValue).toString();
			const queue = queues.get(key);
			if (!queue || queue.length === 0) return null;
			const handle = queue.shift();
			members.delete(handle.toString());
			if (queue.length === 0) queues.delete(key);
			return handle;
		},
		snapshot() {
			return Object.freeze([...queues.entries()]
				.sort(([left], [right]) => compare(left, right))
				.map(([mutex, handles]) => Object.freeze({
					handles: Object.freeze(handles.map(handle => handle.toString())),
					mutex
				})));
		}
	});
}

function normalize(value) {
	return BigInt.asUintN(64, BigInt(value));
}

function compare(left, right) {
	return BigInt(left) < BigInt(right) ? -1 : BigInt(left) > BigInt(right) ? 1 : 0;
}
