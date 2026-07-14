//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes and validates portable guest segments. The Awtsmoos creates address,
 * backing bytes, and permission anew; Awtsmoos.com preserves caller-owned byte
 * arrays when their mapped size is already exact so guest writes remain observable.
 */
export function createMemorySegment(input = {}) {
	const address = safeAddress(input.address ?? input.base ?? 0);
	const source = input.bytes instanceof Uint8Array
		? input.bytes
		: new Uint8Array(input.bytes || 0);
	const requestedSize = Math.max(
		source.length,
		Number(input.memorySize || source.length)
	);
	const bytes = requestedSize === source.length
		? source
		: expandedBytes(source, requestedSize);
	const flags = normalizeFlags(input);
	return {
		address,
		base: address,
		bytes,
		flags,
		name: String(input.name || "segment"),
		permissions: permissionString(flags)
	};
}

export function assertSegmentCanMap(segments, segment, maximumBytes) {
	const total = segments.reduce((sum, item) => sum + item.bytes.length, 0)
		+ segment.bytes.length;
	if (total > maximumBytes) {
		throw segmentError("PORTABLE_MEMORY_LIMIT", `${total}:${maximumBytes}`);
	}
	const start = segment.address;
	const end = start + segment.bytes.length;
	const overlap = segments.find(item => {
		const itemEnd = item.address + item.bytes.length;
		return start < itemEnd && end > item.address;
	});
	if (overlap) {
		throw segmentError(
			"PORTABLE_MEMORY_OVERLAP",
			`${segment.name}:${overlap.name}`
		);
	}
}

export function hasSegmentPermission(segment, permission) {
	const name = permissionName(permission);
	return segment.flags[name] === true;
}

export function segmentSummary(segment) {
	return Object.freeze({
		address: segment.address,
		base: segment.address,
		byteLength: segment.bytes.length,
		end: segment.address + segment.bytes.length,
		flags: Object.freeze({ ...segment.flags }),
		name: segment.name,
		permissions: segment.permissions
	});
}

function normalizeFlags(input) {
	if (input.flags) {
		return {
			execute: input.flags.execute === true,
			read: input.flags.read !== false,
			write: input.flags.write === true
		};
	}
	const permissions = String(input.permissions || "r--");
	return {
		execute: permissions.includes("x"),
		read: permissions.includes("r"),
		write: permissions.includes("w")
	};
}

function permissionName(permission) {
	if (["r", "read"].includes(permission)) return "read";
	if (["w", "write"].includes(permission)) return "write";
	if (["x", "execute"].includes(permission)) return "execute";
	return String(permission);
}

function permissionString(flags) {
	return `${flags.read ? "r" : "-"}${flags.write ? "w" : "-"}${flags.execute ? "x" : "-"}`;
}

function expandedBytes(source, size) {
	const bytes = new Uint8Array(size);
	bytes.set(source);
	return bytes;
}

function safeAddress(value) {
	const address = Number(value);
	if (!Number.isSafeInteger(address) || address < 0) {
		throw segmentError("PORTABLE_MEMORY_ADDRESS", value);
	}
	return address;
}

function segmentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
