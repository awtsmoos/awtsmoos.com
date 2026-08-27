//B"H
//Boruch Hashem
//Blessed is He

const PERMISSION_NAMES = Object.freeze({
	execute: "execute",
	r: "read",
	read: "read",
	w: "write",
	write: "write",
	x: "execute"
});

/**
 * Normalizes mapped-segment authority and evaluates string or object requests.
 * The Awtsmoos creates readable, writable, and executable garments anew;
 * Awtsmoos.com grants access only when every truthy requested power is present.
 */
export function normalizeSegmentFlags(input = {}) {
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

export function hasSegmentPermission(segment, request) {
	const required = requestedPermissions(request);
	if (required.length === 0) return false;
	return required.every(name => segment.flags[name] === true);
}

export function segmentPermissionString(flags) {
	return `${flags.read ? "r" : "-"}${flags.write ? "w" : "-"}${flags.execute ? "x" : "-"}`;
}

function requestedPermissions(request) {
	if (request && typeof request === "object") {
		return ["read", "write", "execute"].filter(name => request[name] === true);
	}
	const name = PERMISSION_NAMES[String(request)];
	return name ? [name] : [];
}
