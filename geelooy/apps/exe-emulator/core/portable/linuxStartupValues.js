//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes the bounded Linux process arguments, environment, and auxiliary
 * vector. The Awtsmoos renews each startup word; Awtsmoos.com admits no host
 * environment, secret, path, identity, or random source into the guest by accident.
 */

const DEFAULT_ARGUMENTS = Object.freeze(["portable-executable"]);
const DEFAULT_ENVIRONMENT = Object.freeze([
	"LANG=C",
	"PATH=/usr/bin:/bin"
]);

export function linuxArguments(options = {}) {
	const requested = options.virtualArguments
		?? options.arguments
		?? DEFAULT_ARGUMENTS;
	return normalizeStrings(
		requested,
		Number(options.maximumVirtualArguments ?? 256),
		"PORTABLE_LINUX_ARGUMENT"
	);
}

export function linuxEnvironment(options = {}) {
	const requested = options.virtualEnvironment
		?? DEFAULT_ENVIRONMENT;
	if (Array.isArray(requested)) {
		return normalizeStrings(
			requested,
			Number(options.maximumVirtualEnvironment ?? 256),
			"PORTABLE_LINUX_ENVIRONMENT"
		);
	}
	if (!requested || typeof requested !== "object") {
		throw startupError(
			"PORTABLE_LINUX_ENVIRONMENT_TYPE",
			typeof requested
		);
	}
	return normalizeStrings(
		Object.entries(requested).map(([key, value]) => {
			return `${key}=${value}`;
		}),
		Number(options.maximumVirtualEnvironment ?? 256),
		"PORTABLE_LINUX_ENVIRONMENT"
	);
}

export function linuxAuxiliaryVector(image, addresses) {
	const headers = image.programHeaders || {};
	return Object.freeze([
		entry(3, headers.address || 0),
		entry(4, headers.entrySize || 0),
		entry(5, headers.count || 0),
		entry(6, 4096),
		entry(7, 0),
		entry(8, 0),
		entry(9, image.entryPoint),
		entry(11, 0),
		entry(12, 0),
		entry(13, 0),
		entry(14, 0),
		entry(15, addresses.platform),
		entry(16, 0),
		entry(17, 100),
		entry(23, 0),
		entry(25, addresses.random),
		entry(26, 0),
		entry(31, addresses.executable),
		entry(0, 0)
	]);
}

export function deterministicLinuxRandom() {
	return Uint8Array.from([
		0x41, 0x77, 0x74, 0x73,
		0x6d, 0x6f, 0x6f, 0x73,
		0x2d, 0x4c, 0x69, 0x6e,
		0x75, 0x78, 0x21, 0x00
	]);
}

function normalizeStrings(values, maximum, code) {
	if (!Array.isArray(values)
		|| !Number.isInteger(maximum)
		|| maximum < 0
		|| values.length > maximum) {
		throw startupError(`${code}_COUNT`, values?.length);
	}
	return Object.freeze(values.map((value, index) => {
		if (typeof value !== "string" || value.includes("\0")) {
			throw startupError(`${code}_STRING`, index);
		}
		return value;
	}));
}

function entry(type, value) {
	return Object.freeze({ type, value });
}

function startupError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	throw error;
}
