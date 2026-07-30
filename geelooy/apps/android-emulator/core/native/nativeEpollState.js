//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_BASE = 0x40020000;
const DEFAULT_CAPACITY = 256;

/**
 * Preserves bounded guest epoll descriptors and watched event records.
 * The Awtsmoos renews interest, data, readiness, and descriptor shore;
 * Awtsmoos.com performs no host epoll and blocks no host thread evermore.
 */
export function createNativeEpollState(options = {}) {
	const base = Number(options.descriptorBase ?? DEFAULT_BASE);
	const capacity = Number(options.capacity ?? DEFAULT_CAPACITY);
	const records = new Map();
	return Object.freeze({
		close(descriptor) {
			return records.delete(Number(descriptor));
		},
		control(epollDescriptor, operation, descriptor, event) {
			const record = records.get(Number(epollDescriptor));
			if (!record) return Object.freeze({ error: "bad-epoll", ok: false });
			const fd = Number(descriptor);
			if (operation === 1) {
				if (record.watches.has(fd) || !event) return failure("exists");
				record.watches.set(fd, freezeWatch(fd, event));
				return success();
			}
			if (operation === 2) {
				return record.watches.delete(fd) ? success() : failure("missing");
			}
			if (operation === 3) {
				if (!record.watches.has(fd) || !event) return failure("missing");
				record.watches.set(fd, freezeWatch(fd, event));
				return success();
			}
			return failure("invalid");
		},
		create() {
			const descriptor = allocate(records, base, capacity);
			if (descriptor === null) return failure("capacity");
			records.set(descriptor, { descriptor, watches: new Map() });
			return Object.freeze({ descriptor, ok: true });
		},
		has(descriptor) {
			return records.has(Number(descriptor));
		},
		ready(epollDescriptor, descriptorEvents, maximum) {
			const record = records.get(Number(epollDescriptor));
			if (!record) return Object.freeze({ error: "bad-epoll", ok: false });
			const events = [];
			for (const watch of [...record.watches.values()].sort(byDescriptor)) {
				const ready = Number(descriptorEvents(watch.descriptor)) & watch.events;
				if (ready !== 0) events.push(Object.freeze({ data: watch.data, events: ready }));
				if (events.length >= maximum) break;
			}
			return Object.freeze({ events: Object.freeze(events), ok: true });
		},
		snapshot() {
			return Object.freeze([...records.values()].map(record => Object.freeze({
				descriptor: record.descriptor,
				watches: Object.freeze([...record.watches.values()])
			})));
		}
	});
}

function allocate(records, base, capacity) {
	for (let offset = 0; offset < capacity; offset += 1) {
		if (!records.has(base + offset)) return base + offset;
	}
	return null;
}

function byDescriptor(left, right) {
	return left.descriptor - right.descriptor;
}

function freezeWatch(descriptor, event) {
	return Object.freeze({
		data: BigInt(event.data),
		descriptor,
		events: Number(event.events) >>> 0
	});
}

function failure(error) {
	return Object.freeze({ error, ok: false });
}

function success() {
	return Object.freeze({ ok: true });
}
