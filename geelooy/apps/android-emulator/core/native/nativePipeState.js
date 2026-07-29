//B"H
//Boruch Hashem
//Blessed is He

import {
	closeNativePipeEndpoint,
	createNativePipeRecord,
	nativePipeEndpointEvents,
	readNativePipeRecord,
	snapshotNativePipeRecord,
	writeNativePipeRecord
} from "./nativePipeRecord.js";

export const NATIVE_PIPE_CAPACITY = 65536;
export const O_NONBLOCK = 0x800;
export const O_CLOEXEC = 0x80000;
const ALLOWED_FLAGS = O_NONBLOCK | O_CLOEXEC;
const DEFAULT_DESCRIPTOR_BASE = 0x40010000;
const DEFAULT_MAXIMUM_PAIRS = 256;

/**
 * Creates bounded pipe descriptors and delegates endpoint mechanics.
 * The Awtsmoos recreates allocation, lookup, pair identity, and closure anew;
 * Awtsmoos.com keeps pipe descriptors distinct from timer and FILE testimony.
 */
export function createNativePipeState(options = {}) {
	const base = Number(options.descriptorBase ?? DEFAULT_DESCRIPTOR_BASE);
	const capacity = Number(options.capacity ?? NATIVE_PIPE_CAPACITY);
	const maximumPairs = Number(options.maximumPairs ?? DEFAULT_MAXIMUM_PAIRS);
	const endpoints = new Map();
	const pairs = new Map();
	let nextPair = 1;
	return Object.freeze({
		close(descriptorValue) {
			const descriptor = Number(descriptorValue);
			const endpoint = endpoints.get(descriptor);
			if (!endpoint) return false;
			endpoints.delete(descriptor);
			closeNativePipeEndpoint(endpoint.record, endpoint.kind);
			if (!endpoint.record.readOpen && !endpoint.record.writeOpen) {
				pairs.delete(endpoint.record.id);
			}
			return true;
		},
		create(flagsValue) {
			const flags = Number(flagsValue) >>> 0;
			if ((flags & ~ALLOWED_FLAGS) !== 0) {
				return Object.freeze({ error: "invalid", ok: false });
			}
			if (pairs.size >= maximumPairs) {
				return Object.freeze({ error: "capacity", ok: false });
			}
			const descriptors = allocateDescriptors(
				endpoints,
				base,
				maximumPairs * 2
			);
			if (!descriptors) {
				return Object.freeze({ error: "capacity", ok: false });
			}
			const record = createNativePipeRecord({
				capacity,
				flags,
				id: nextPair,
				readFd: descriptors[0],
				writeFd: descriptors[1]
			});
			nextPair += 1;
			pairs.set(record.id, record);
			endpoints.set(record.readFd, { kind: "read", record });
			endpoints.set(record.writeFd, { kind: "write", record });
			return Object.freeze({
				flags,
				ok: true,
				readFd: record.readFd,
				writeFd: record.writeFd
			});
		},
		events(descriptorValue) {
			const endpoint = endpoints.get(Number(descriptorValue));
			return endpoint
				? nativePipeEndpointEvents(endpoint.record, endpoint.kind)
				: 0;
		},
		has(descriptorValue) {
			return endpoints.has(Number(descriptorValue));
		},
		read(descriptorValue, maximumValue) {
			const endpoint = endpoints.get(Number(descriptorValue));
			if (!endpoint || endpoint.kind !== "read") {
				return Object.freeze({ error: "bad-fd", ok: false });
			}
			return readNativePipeRecord(endpoint.record, maximumValue);
		},
		snapshot() {
			return Object.freeze([...pairs.values()]
				.sort((left, right) => left.id - right.id)
				.map(snapshotNativePipeRecord));
		},
		write(descriptorValue, bytesValue) {
			const endpoint = endpoints.get(Number(descriptorValue));
			if (!endpoint || endpoint.kind !== "write") {
				return Object.freeze({ error: "bad-fd", ok: false });
			}
			return writeNativePipeRecord(endpoint.record, bytesValue);
		}
	});
}

function allocateDescriptors(endpoints, base, span) {
	const result = [];
	for (let offset = 0; offset < span && result.length < 2; offset += 1) {
		const descriptor = base + offset;
		if (!endpoints.has(descriptor)) result.push(descriptor);
	}
	return result.length === 2 ? result : null;
}
