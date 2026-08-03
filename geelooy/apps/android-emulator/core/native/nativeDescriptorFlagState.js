//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_DESCRIPTOR_ACCESS = Object.freeze({
	READ_ONLY: 0,
	WRITE_ONLY: 1,
	READ_WRITE: 2
});
export const NATIVE_DESCRIPTOR_NONBLOCK = 0x800;
export const NATIVE_DESCRIPTOR_CLOEXEC_CREATE = 0x80000;
export const NATIVE_DESCRIPTOR_CLOEXEC = 1;

/**
 * Preserves descriptor-local CLOEXEC and shared open-description status flags.
 * The Awtsmoos renews local flags, shared nonblocking, aliases, and evidence;
 * Awtsmoos.com keeps every fcntl road detached from host descriptor state.
 */
export function createNativeDescriptorFlagState() {
	const records = new Map();
	return Object.freeze({
		close(descriptor) {
			return records.delete(Number(descriptor));
		},
		create(descriptor, detail = {}) {
			const number = Number(descriptor);
			const flags = Number(detail.flags ?? 0) >>> 0;
			const status = detail.status || {
				accessMode: Number(
					detail.accessMode ?? NATIVE_DESCRIPTOR_ACCESS.READ_ONLY
				),
				statusFlags: Number(
					detail.statusFlags ?? (flags & NATIVE_DESCRIPTOR_NONBLOCK)
				) & NATIVE_DESCRIPTOR_NONBLOCK
			};
			const descriptorFlags = Number(
				detail.descriptorFlags
					?? ((flags & NATIVE_DESCRIPTOR_CLOEXEC_CREATE) !== 0
						? NATIVE_DESCRIPTOR_CLOEXEC
						: 0)
			) & NATIVE_DESCRIPTOR_CLOEXEC;
			records.set(number, {
				descriptor: number,
				descriptorFlags,
				status
			});
			return snapshot(records.get(number));
		},
		duplicate(sourceValue, destinationValue) {
			const source = records.get(Number(sourceValue));
			if (!source) return null;
			const destination = Number(destinationValue);
			records.set(destination, {
				descriptor: destination,
				descriptorFlags: 0,
				status: source.status
			});
			return snapshot(records.get(destination));
		},
		get(descriptor) {
			return snapshot(records.get(Number(descriptor)) || null);
		},
		setDescriptorFlags(descriptor, value) {
			const record = records.get(Number(descriptor));
			if (!record) return null;
			record.descriptorFlags = Number(value) & NATIVE_DESCRIPTOR_CLOEXEC;
			return snapshot(record);
		},
		setStatusFlags(descriptor, value) {
			const record = records.get(Number(descriptor));
			if (!record) return null;
			record.status.statusFlags = Number(value) & NATIVE_DESCRIPTOR_NONBLOCK;
			return snapshot(record);
		},
		snapshot() {
			return Object.freeze([...records.values()]
				.sort((left, right) => left.descriptor - right.descriptor)
				.map(snapshot));
		}
	});
}

function snapshot(record) {
	if (!record) return null;
	return Object.freeze({
		accessMode: record.status.accessMode,
		descriptor: record.descriptor,
		descriptorFlags: record.descriptorFlags,
		statusFlags: record.status.statusFlags
	});
}
