//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates and operates one deterministic native Android looper record.
 * The Awtsmoos recreates descriptor, wake, event, and readiness every instant;
 * Awtsmoos.com performs no host descriptor polling inside this guest vessel.
 */
export function createNativeAndroidLooperRecord(detail) {
	return {
		descriptors: new Map(),
		events: [],
		handle: normalizeLooperValue(detail.handle),
		options: unsignedLooperInt32(detail.options),
		references: 1,
		thread: normalizeLooperValue(detail.thread),
		wakePending: false
	};
}

export function addLooperDescriptor(record, detail) {
	const fd = signedLooperInt32(detail.fd);
	const ident = signedLooperInt32(detail.ident);
	const callback = normalizeLooperValue(detail.callback);
	if (fd < 0 || (callback === 0n && ident < 0)) return false;
	record.descriptors.set(fd, Object.freeze({
		callback,
		data: normalizeLooperValue(detail.data),
		events: unsignedLooperInt32(detail.events),
		fd,
		ident
	}));
	return true;
}

export function enqueueLooperEvent(record, fdValue, eventsValue) {
	const fd = signedLooperInt32(fdValue);
	if (!record.descriptors.has(fd)) return false;
	record.events.push(Object.freeze({
		events: unsignedLooperInt32(eventsValue),
		fd
	}));
	return true;
}

export function pollLooperRecord(record, descriptorEvents = null) {
	if (record.wakePending) {
		record.wakePending = false;
		return Object.freeze({ handle: record.handle, kind: "wake" });
	}
	while (record.events.length) {
		const event = record.events.shift();
		const descriptor = record.descriptors.get(event.fd);
		if (descriptor) return eventResult(record, descriptor, event.events);
	}
	if (descriptorEvents) {
		for (const descriptor of record.descriptors.values()) {
			const ready = unsignedLooperInt32(descriptorEvents(descriptor.fd))
				& descriptor.events;
			if (ready !== 0) return eventResult(record, descriptor, ready);
		}
	}
	return Object.freeze({ handle: record.handle, kind: "timeout" });
}

export function snapshotLooperRecord(record) {
	return Object.freeze({
		descriptors: Object.freeze([...record.descriptors.values()]),
		handle: record.handle.toString(),
		options: record.options,
		queuedEvents: record.events.length,
		references: record.references,
		thread: record.thread.toString(),
		wakePending: record.wakePending
	});
}

export function normalizeLooperValue(value) {
	return BigInt.asUintN(64, BigInt(value ?? 0));
}

export function signedLooperInt32(value) {
	return Number(BigInt.asIntN(32, BigInt(value ?? 0)));
}

export function unsignedLooperInt32(value) {
	return Number(BigInt.asUintN(32, BigInt(value ?? 0)));
}

function eventResult(record, descriptor, events) {
	return Object.freeze({
		...descriptor,
		events,
		handle: record.handle,
		kind: "event"
	});
}
