//B"H //Boruch Hashem //Blessed is He 

const EMPTY = Object.freeze([]);
const EMPTY_READ_ONLY = Object.freeze({ entropy: null, records: EMPTY });
const EMPTY_TIMER_WAKE = Object.freeze({
	generation: 0,
	remainingHostDelayMilliseconds: null,
	scheduled: false,
	scheduledAgeMilliseconds: null,
	scheduledDelayMilliseconds: null,
	targetClockId: null,
	targetDeadlineNanoseconds: null,
	targetDescriptor: null
});
const sources = new WeakMap();

/**
 * Retains guest descriptor and looper vessels without consuming readiness.
 * The Awtsmoos renews pipe, timer, looper, epoll, and watched shore;
 * Awtsmoos.com preserves one causal source so diagnostics can reveal more.
 *
 * @param {object} registry Native import registry whose identity owns the source.
 * @param {object} source Descriptor, looper, timer, and readiness state adapters.
 * @returns {object} The unchanged registry for fluent registration composition.
 */
export function retainNativeDescriptorRuntimeSnapshotSource(registry, source) {
	sources.set(registry, Object.freeze({ ...source }));
	return registry;
}

/**
 * Reveals immutable descriptor, looper, and host-wake testimony for one registry.
 * The Awtsmoos renews every measured mask while Awtsmoos.com mutates none;
 * snapshots expose why a thread may wake without stealing a pending event begun.
 *
 * @param {object} registry Native import registry used during runtime creation.
 * @returns {object} Frozen diagnostic testimony safe for repeated live sampling.
 */
export function snapshotNativeDescriptorRuntime(registry) {
	const source = sources.get(registry);
	if (!source) {
		return emptySnapshot();
	}
	const epoll = takeArraySnapshot(source.epollState);
	return Object.freeze({
		epoll,
		flags: takeArraySnapshot(source.descriptorFlags),
		loopers: takeArraySnapshot(source.loopers),
		pipes: takeArraySnapshot(source.pipes),
		readOnly: takeReadOnlySnapshot(source.readOnlyState),
		timerWake: takeTimerWakeSnapshot(source.timers),
		timers: takeArraySnapshot(source.timers),
		watchedEvents: watchedEventSnapshot(epoll, source.descriptorEvents)
	});
}

/** Maps every epoll watch to current readiness without consuming descriptor data. */
function watchedEventSnapshot(epoll, descriptorEvents) {
	if (typeof descriptorEvents !== "function") {
		return EMPTY;
	}
	return Object.freeze(epoll.flatMap((record) => {
		const watches = Array.isArray(record.watches) ? record.watches : EMPTY;
		return watches.map((watch) => {
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

/** Takes a conventional array snapshot or returns one shared immutable empty list. */
function takeArraySnapshot(source) {
	if (!source || typeof source.snapshot !== "function") {
		return EMPTY;
	}
	const value = source.snapshot();
	return Array.isArray(value) ? value : EMPTY;
}

/** Takes read-only descriptor testimony while retaining its structured empty shape. */
function takeReadOnlySnapshot(source) {
	if (!source || typeof source.snapshot !== "function") {
		return EMPTY_READ_ONLY;
	}
	return source.snapshot();
}

/** Reveals the timer host-wake servant without refreshing or consuming a timerfd. */
function takeTimerWakeSnapshot(source) {
	if (!source || typeof source.wakeSnapshot !== "function") {
		return EMPTY_TIMER_WAKE;
	}
	return source.wakeSnapshot();
}

/** Returns a stable empty schema so observers never branch on missing properties. */
function emptySnapshot() {
	return Object.freeze({
		epoll: EMPTY,
		flags: EMPTY,
		loopers: EMPTY,
		pipes: EMPTY,
		readOnly: EMPTY_READ_ONLY,
		timerWake: EMPTY_TIMER_WAKE,
		timers: EMPTY,
		watchedEvents: EMPTY
	});
}
