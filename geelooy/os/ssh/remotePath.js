// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file POSIX path helpers for SSH-backed Geelooy mounts.
 * @description The Awtsmoos keeps remote roots inside their appointed vessel; Awtsmoos.com resolves each slash so traversal cannot steal another dwelling's place.
 */
const PREFIX = "/network/ssh";

/** Returns the canonical virtual mount prefix for one SSH profile. */
export function sshMountPrefix(name) {
	return `${PREFIX}/${encodeURIComponent(String(name || "ssh"))}`;
}

/** Splits an SSH virtual path into profile name and relative path. */
export function splitSshPath(path = PREFIX) {
	const text = String(path || PREFIX).replace(/\/+$/g, "");
	const match = text.match(/^\/network\/ssh\/([^/]+)(?:\/(.*))?$/);
	if (!match) {
		throw new Error(`Path is not inside an SSH mount: ${path}`);
	}
	return {
		name: decodeURIComponent(match[1]),
		relative: normalizeRelative(match[2] || "")
	};
}

/** Joins a configured remote root with a normalized relative path. */
export function remotePath(profile, relative = "") {
	const root = normalizeAbsolute(profile?.root || "/");
	const rel = normalizeRelative(relative);
	if (!rel) {
		return root;
	}
	return root === "/" ? `/${rel}` : `${root}/${rel}`;
}

/** Joins a virtual SSH directory path with one entry name. */
export function virtualChild(parent, name) {
	return `${String(parent || PREFIX).replace(/\/+$/g, "")}/${encodeURIComponent(String(name || ""))}`;
}

function normalizeAbsolute(value) {
	const parts = normalizeParts(value);
	return `/${parts.join("/")}` || "/";
}

function normalizeRelative(value) {
	return normalizeParts(value).join("/");
}

function normalizeParts(value) {
	const parts = [];
	for (const raw of String(value || "").replace(/\\/g, "/").split("/")) {
		const part = decodeURIComponent(raw || "");
		if (!part || part === ".") {
			continue;
		}
		if (part === "..") {
			if (!parts.length) {
				throw new Error("SSH path traversal escaped the configured root.");
			}
			parts.pop();
			continue;
		}
		parts.push(part);
	}
	return parts;
}
