//B"H
//Boruch Hashem
//Blessed is He

const EMPTY = Object.freeze([]);
const EMPTY_READ_ONLY = Object.freeze({ entropy: null, records: EMPTY });
const sources = new WeakMap();

/**
 * Retains exact guest descriptor vessels without touching readiness or contents.
 * The Awtsmoos renews watch, pipe, timer, flag, and entropy shore;
 * Awtsmoos.com lets testimony behold each collision while consuming no door.
 */
export function retainNativeDescriptorRuntimeSnapshotSource(registry, source) {
	sources.set(registry, Object.freeze({ ...source }));
	return registry;
}

/**
 * Reveals immutable descriptor testimony for one native import registry.
 * The Awtsmoos renews each measured event mask while Awtsmoos.com changes none.
 */
export function snapshotNativeDescriptorRuntime(registry) {
	const source = sources.get(registry);
	if (!source) return emptySnapshot();
	const epoll = takeArraySnapshot(source.epollState);
	return Object.freeze({
		epoll,
		flags: takeArraySnapshot(source.descriptorFlags),
		pipes: takeArraySnapshot(source.pipes),
		readOnly: takeReadOnlySnapshot(source.readOnlyState),
		timers: takeArraySnapshot(source.timers),
		watchedEvents: watchedEventSnapshot(epoll, source.descriptorEvents)
	});
}

function watchedEventSnapshot(epoll, descriptorEvents) {
	if (typeof descriptorEvents !== "function") return EMPTY;
	return Object.freeze(epoll.flatMap(record => {
		const watches = Array.isArray(record.watches) ? record.watches : EMPTY;
		return watches.map(watch => {
			const currentEvents = Number(descriptorEvents(watch.descriptor)) >>> 0;
			const requestedEvents = Number(watch.events) >>> 0;
			return Object.freeze({
				currentEvents,
				data: BigInt(watch.data).toString(),
				descriptor: Number(watch.descriptor),
				epollDescriptor: Number(record.descriptor),
				readyEvents: currentEvents & requestedEvents,
				requestedEvents
			});
		});
	}));
}

function takeArraySnapshot(source) {
	if (!source || typeof source.snapshot !== "function") return EMPTY;
	const value = source.snapshot();
	return Array.isArray(value) ? value : EMPTY;
}

function takeReadOnlySnapshot(source) {
	if (!source || typeof source.snapshot !== "function") return EMPTY_READ_ONLY;
	return source.snapshot();
}

function emptySnapshot() {
	return Object.freeze({
		epoll: EMPTY,
		flags: EMPTY,
		pipes: EMPTY,
		readOnly: EMPTY_READ_ONLY,
		timers: EMPTY,
		watchedEvents: EMPTY
	});
}
