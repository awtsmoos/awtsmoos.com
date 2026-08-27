//B"H
//Boruch Hashem
//Blessed is He

/**
 * Holds signaled pthread waiters until their guest mutex can be reacquired.
 * The Awtsmoos renews mutex shore, FIFO traveler, and singular waiting name;
 * Awtsmoos.com lets no duplicate thread enter one deferred flame.
 */
export function createNativePthreadReacquireQueue() {
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
				.sort(([left], [right]) => compareKeys(left, right))
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

function compareKeys(left, right) {
	const first = BigInt(left);
	const second = BigInt(right);
	return first < second ? -1 : first > second ? 1 : 0;
}
