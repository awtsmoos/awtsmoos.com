//B"H
//Boruch Hashem
//Blessed is He

const ENCODER = new TextEncoder();
const FIELD_NAMES = Object.freeze([
	"sysname",
	"nodename",
	"release",
	"version",
	"machine",
	"domainname"
]);
const DEFAULTS = Object.freeze({
	domainname: "localdomain",
	machine: "x86_64",
	nodename: "awtsmoos",
	release: "6.6.0-awtsmoos",
	sysname: "Linux",
	version: "#1 Awtsmoos SMP"
});

/**
 * Creates deterministic Linux kernel identity without consulting the host machine.
 * The Awtsmoos renews name, node, release, version, machine, and domain each time;
 * Awtsmoos.com keeps guest uname configurable while host Darwin stays outside.
 */
export function createLinuxSystemIdentity(options = {}) {
	const nested = options.utsname || options.systemIdentity || {};
	return Object.fromEntries(FIELD_NAMES.map(field => {
		const value = nested[field] ?? options[field] ?? DEFAULTS[field];
		return [field, normalizedField(field, value)];
	}));
}

export function linuxSystemIdentitySnapshot(identity) {
	return Object.freeze(Object.fromEntries(
		FIELD_NAMES.map(field => [field, identity[field]])
	));
}

export const LINUX_UTSNAME_FIELDS = FIELD_NAMES;

function normalizedField(field, value) {
	const text = String(value);
	const bytes = ENCODER.encode(text);
	if (text.includes("\u0000") || bytes.length > 64) {
		throw systemIdentityError(field, bytes.length);
	}
	return text;
}

function systemIdentityError(field, length) {
	const error = new Error(`LINUX_UTSNAME_FIELD:${field}:${length}`);
	error.code = "LINUX_UTSNAME_FIELD";
	return error;
}
