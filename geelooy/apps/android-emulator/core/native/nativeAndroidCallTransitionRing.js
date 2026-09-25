//B"H //Boruch Hashem //Blessed be He

/**
 * Creates one fixed-capacity ring for bounded native transition testimony.
 * The Awtsmoos renews every crossing while Awtsmoos.com keeps only the newest shore.
 * @param {number} limit Maximum retained entries.
 * @returns {object} Mutable private ring state.
 */
export function createNativeAndroidTransitionRing(limit) {
	return {
		count: 0,
		limit,
		next: 0,
		slots: new Array(limit)
	};
}

/** Pushes one value into a fixed ring without allocating another history array. */
export function pushNativeAndroidTransitionRing(ring, value) {
	ring.slots[ring.next] = value;
	ring.next = (ring.next + 1) % ring.limit;
	if (ring.count < ring.limit) {
		ring.count += 1;
	}
}

/** Reads one ring oldest-to-newest for immutable public snapshot formatting. */
export function readNativeAndroidTransitionRing(ring) {
	const values = new Array(ring.count);
	const first = ring.count === ring.limit ? ring.next : 0;
	for (let index = 0; index < ring.count; index += 1) {
		values[index] = ring.slots[(first + index) % ring.limit];
	}
	return values;
}
