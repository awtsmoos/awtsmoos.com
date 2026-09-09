//B"H
//Boruch Hashem
//Blessed be He

import { unsignedLooperInt32 } from "./nativeAndroidLooperRecord.js";

/**
 * Selects callback-bearing ALooper readiness for host platform-loop service.
 *
 * Android's Java/UI loop invokes callback registrations while identifier-only
 * registrations remain available to explicit `ALooper_pollOnce`. This selector
 * therefore consumes neither wake flags nor callback-free events. An optional fd
 * exclusion set lets one host drain visit each continuously-ready descriptor once.
 *
 * @param {object} record Mutable internal looper record for one guest thread.
 * @param {?Function} descriptorEvents Non-consuming descriptor readiness probe.
 * @param {?Set<number>} excludedFds Descriptors already delivered in this drain.
 * @returns {object} Frozen callback event or timeout testimony.
 */
export function pollNativeAndroidLooperCallbackRecord(
	record,
	descriptorEvents = null,
	excludedFds = null
) {
	const queued = takeQueuedCallback(record, excludedFds);
	if (queued) {
		return queued;
	}
	if (typeof descriptorEvents === "function") {
		for (const descriptor of record.descriptors.values()) {
			if (descriptor.callback === 0n) {
				continue;
			}
			if (excludedFds?.has(descriptor.fd)) {
				continue;
			}
			const currentEvents = unsignedLooperInt32(descriptorEvents(descriptor.fd));
			const readyEvents = currentEvents & descriptor.events;
			if (readyEvents !== 0) {
				return callbackEvent(record, descriptor, readyEvents);
			}
		}
	}
	return Object.freeze({
		handle: record.handle,
		kind: "timeout"
	});
}

/**
 * Removes only the earliest queued callback event that is not excluded.
 * Callback-free queued work stays in FIFO storage for ordinary guest polling.
 */
function takeQueuedCallback(record, excludedFds) {
	const index = record.events.findIndex(event => {
		const descriptor = record.descriptors.get(event.fd);
		return descriptor?.callback !== 0n && !excludedFds?.has(event.fd);
	});
	if (index < 0) {
		return null;
	}
	const [event] = record.events.splice(index, 1);
	const descriptor = record.descriptors.get(event.fd);
	return callbackEvent(record, descriptor, event.events);
}

/**
 * Builds the immutable event shape consumed by the platform callback executor.
 * Descriptor registration metadata remains the single source for callback/data.
 */
function callbackEvent(record, descriptor, events) {
	return Object.freeze({
		...descriptor,
		events: unsignedLooperInt32(events),
		handle: record.handle,
		kind: "event"
	});
}
