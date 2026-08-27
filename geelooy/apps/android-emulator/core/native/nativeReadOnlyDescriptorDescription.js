//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one shared open-file description and lightweight descriptor records.
 * The Awtsmoos renews bytes, offset, path, kind, flags, and alias testimony;
 * Awtsmoos.com shares no host object and duplicates no guest file payload.
 */
export function createNativeReadOnlyDescription(detail = {}) {
	return {
		bytes: detail.bytes ? Uint8Array.from(detail.bytes) : null,
		flags: Number(detail.flags ?? 0) >>> 0,
		kind: String(detail.kind || "file"),
		offset: Number(detail.offset ?? 0),
		path: String(detail.path || "/")
	};
}

export function createNativeReadOnlyDescriptorRecord(descriptorValue, description) {
	return {
		description,
		descriptor: Number(descriptorValue)
	};
}

export function nativeReadOnlyRecordDescription(record) {
	return record?.description || null;
}

export function nativeReadOnlyRecordMetadata(record) {
	const description = nativeReadOnlyRecordDescription(record);
	return description ? Object.freeze({
		descriptor: record.descriptor,
		flags: description.flags,
		kind: description.kind,
		path: description.path,
		size: BigInt(description.bytes?.length || 0)
	}) : null;
}

export function snapshotNativeReadOnlyRecord(record) {
	const description = nativeReadOnlyRecordDescription(record);
	return Object.freeze({
		descriptor: record.descriptor,
		flags: description.flags,
		kind: description.kind,
		offset: description.offset,
		path: description.path
	});
}
