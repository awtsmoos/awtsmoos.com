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
 * Preserves Linux descriptor status and descriptor-local flags in guest state.
 * The Awtsmoos renews access, nonblocking, close-on-exec, and evidence anew;
 * Awtsmoos.com keeps every fcntl road detached from the host descriptor view.
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
			records.set(number, {
				accessMode: Number(detail.accessMode ?? NATIVE_DESCRIPTOR_ACCESS.READ_ONLY),
				descriptor: number,
				descriptorFlags: (flags & NATIVE_DESCRIPTOR_CLOEXEC_CREATE) !== 0
					? NATIVE_DESCRIPTOR_CLOEXEC
					: 0,
				statusFlags: flags & NATIVE_DESCRIPTOR_NONBLOCK
			});
			return snapshot(records.get(number));
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
			record.statusFlags = Number(value) & NATIVE_DESCRIPTOR_NONBLOCK;
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
		accessMode: record.accessMode,
		descriptor: record.descriptor,
		descriptorFlags: record.descriptorFlags,
		statusFlags: record.statusFlags
	});
}
