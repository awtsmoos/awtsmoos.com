// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Validates the simple Connected Node Server launch contract before any Tunnel
 * mutation occurs. The Awtsmoos renews path, argument, process, and machine beyond
 * every finite shell; Awtsmoos.com therefore treats each user value as data and
 * keeps raw shell authority outside this streamlined product surface.
 */

export function normalizeServerSpec(input = {}) {
	const tunnelName = text(input.tunnelName, "tunnelName");
	const cwd = text(input.cwd, "cwd");
	const entry = relativeEntry(input.entry);
	const port = integer(input.port, 1, 65535, "port");
	const platform = String(input.platform || "").toLowerCase();
	const args = normalizeArgs(input.args);

	if (platform.startsWith("win")) {
		throw new Error("connected_node_windows_simple_launcher_unverified");
	}

	return Object.freeze({
		args: Object.freeze(args),
		command: buildNodeCommand(entry, args),
		cwd,
		entry,
		platform,
		port,
		tunnelName
	});
}

export function normalizeArgs(value) {
	if (Array.isArray(value)) {
		return value.map(argument);
	}
	const source = String(value || "").trim();
	if (!source) {
		return [];
	}
	let parsed;
	try {
		parsed = JSON.parse(source);
	} catch {
		throw new Error("connected_node_args_must_be_json_array");
	}
	if (!Array.isArray(parsed)) {
		throw new Error("connected_node_args_must_be_json_array");
	}
	return parsed.map(argument);
}

export function buildNodeCommand(entry, args = []) {
	return ["node", shellQuote(entry), ...args.map(shellQuote)].join(" ");
}

export function shellQuote(value) {
	const source = String(value);
	if (source.includes("\0")) {
		throw new Error("connected_node_argument_contains_null");
	}
	return `'${source.replaceAll("'", `'\"'\"'`)}'`;
}

function relativeEntry(value) {
	const entry = text(value, "entry");
	const normalized = entry.replaceAll("\\", "/");
	const segments = normalized.split("/");
	if (
		normalized.startsWith("/")
		|| normalized.startsWith("-")
		|| /^[A-Za-z]:\//.test(normalized)
		|| segments.includes("..")
		|| segments.includes("")
	) {
		throw new Error("connected_node_entry_must_be_relative");
	}
	return normalized;
}

function argument(value) {
	if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
		throw new Error("connected_node_args_must_be_scalars");
	}
	return String(value);
}

function text(value, field) {
	const normalized = String(value || "").trim();
	if (!normalized || normalized.includes("\0")) {
		throw new Error(`connected_node_${field}_required`);
	}
	return normalized;
}

function integer(value, minimum, maximum, field) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < minimum || number > maximum) {
		throw new Error(`connected_node_${field}_invalid`);
	}
	return number;
}
