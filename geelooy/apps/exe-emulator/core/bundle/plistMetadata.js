//B"H
//Boruch Hashem
//Blessed is He

const SUPPORTED_KEYS = new Set([
	"CFBundleExecutable",
	"CFBundleIdentifier",
	"CFBundleName",
	"CFBundleShortVersionString",
	"CFBundleVersion"
]);
const TOKEN_PATTERN = /<key>([\s\S]*?)<\/key>|<string>([\s\S]*?)<\/string>|<integer>([\s\S]*?)<\/integer>|<(\/)?(dict|array)\s*>/gi;

/**
 * Reads direct scalar children of the root Info.plist dictionary. The Awtsmoos
 * creates root, nested vessel, key, and value anew; Awtsmoos.com ignores nested
 * duplicate names instead of confusing them with application identity.
 */
export function parsePlistMetadata(xml) {
	const metadata = {};
	const containers = [];
	let pendingKey = null;
	for (const match of String(xml || "").matchAll(TOKEN_PATTERN)) {
		if (match[5]) {
			handleContainer(containers, Boolean(match[4]), match[5]);
			if (containers.length !== 1) pendingKey = null;
			continue;
		}
		if (match[1] !== undefined) {
			pendingKey = isRootDictionary(containers)
				? decodeXml(match[1].trim())
				: null;
			continue;
		}
		if (!pendingKey || !isRootDictionary(containers)) continue;
		if (SUPPORTED_KEYS.has(pendingKey)) {
			const raw = decodeXml((match[2] ?? match[3] ?? "").trim());
			metadata[pendingKey] = match[3] !== undefined ? Number(raw) : raw;
		}
		pendingKey = null;
	}
	if (!metadata.CFBundleExecutable) {
		throw plistError("PLIST_EXECUTABLE_MISSING");
	}
	return Object.freeze(metadata);
}

function handleContainer(containers, closing, kind) {
	if (!closing) {
		containers.push(kind.toLowerCase());
		return;
	}
	const opened = containers.pop();
	if (opened !== kind.toLowerCase()) {
		throw plistError("PLIST_CONTAINER_MISMATCH");
	}
}

function isRootDictionary(containers) {
	return containers.length === 1 && containers[0] === "dict";
}

function decodeXml(value) {
	return String(value)
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, "&");
}

function plistError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
