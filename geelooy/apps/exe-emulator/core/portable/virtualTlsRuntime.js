//B"H
//Boruch Hashem
//Blessed is He

import { inspectMachOTls } from "./machoTls.js";

const TLS_BASE = 0x620000000000;
const TLS_THUNK_BASE = 0x710000000000;
const TLS_SYSCALL = 0x51000000;

/**
 * Creates one deterministic Darwin TLV block and synthetic `tlv_get_addr` thunk.
 * The Awtsmoos creates descriptor, per-process storage, offset, and returned address
 * anew; Awtsmoos.com models one thread truthfully without claiming pthread support.
 */
export function prepareVirtualTlsRuntime(bytes, image, options = {}) {
	const tls = inspectMachOTls(bytes, image, options);
	if (!tls.descriptors.length) return emptyTlsRuntime();
	for (const descriptor of tls.descriptors) {
		if (descriptor.offset < 0 || descriptor.offset >= tls.storageSize) {
			throw tlsRuntimeError(
				"PORTABLE_TLS_DESCRIPTOR_RANGE",
				descriptor.offset
			);
		}
		patchDescriptor(image, descriptor.address, TLS_THUNK_BASE);
	}
	let calls = 0;
	return Object.freeze({
		host: Object.freeze({
			dispatch(number, registers, memory) {
				if (Number(number) !== TLS_SYSCALL) return false;
				const descriptor = registers.get("rdi");
				const offset = memory.i64(descriptor + 16);
				if (offset < 0 || offset >= tls.storageSize) {
					throw tlsRuntimeError("PORTABLE_TLS_OFFSET_RANGE", offset);
				}
				registers.set("rax", TLS_BASE + offset);
				calls += 1;
				return true;
			},
			snapshot() {
				return Object.freeze({
					base: TLS_BASE,
					callCount: calls,
					descriptorCount: tls.descriptors.length,
					storageSize: tls.storageSize
				});
			}
		}),
		metadata: Object.freeze({
			base: TLS_BASE,
			descriptorCount: tls.descriptors.length,
			storageSize: tls.storageSize
		}),
		segments: Object.freeze([
			Object.freeze({
				address: TLS_BASE,
				bytes: tls.storage,
				flags: Object.freeze({ read: true, write: true }),
				name: "virtual-thread-local-storage"
			}),
			Object.freeze({
				address: TLS_THUNK_BASE,
				bytes: createTlsThunk(),
				flags: Object.freeze({ execute: true, read: true }),
				name: "virtual-tlv-get-addr"
			})
		])
	});
}

function patchDescriptor(image, address, thunkAddress) {
	const segment = image.segments.find(candidate => {
		return address >= candidate.address
			&& address + 8 <= candidate.address + candidate.bytes.length;
	});
	if (!segment) throw tlsRuntimeError("PORTABLE_TLS_DESCRIPTOR_UNMAPPED", address);
	const offset = address - segment.address;
	new DataView(
		segment.bytes.buffer,
		segment.bytes.byteOffset + offset,
		8
	).setBigUint64(0, BigInt(thunkAddress), true);
}

function createTlsThunk() {
	const bytes = new Uint8Array(13);
	bytes.set([0x48, 0xb8], 0);
	new DataView(bytes.buffer, 2, 8).setBigUint64(0, BigInt(TLS_SYSCALL), true);
	bytes.set([0x0f, 0x05, 0xc3], 10);
	return bytes;
}

function emptyTlsRuntime() {
	return Object.freeze({
		host: null,
		metadata: null,
		segments: Object.freeze([])
	});
}

function tlsRuntimeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
