//B"H
//Boruch Hashem
//Blessed is He

const DIRECTORY_MODE = 0o040755;
const REGULAR_MODE = 0o100755;
const CHARACTER_MODE = 0o020666;

/**
 * Creates a deterministic guest filesystem without consulting host paths.
 * The Awtsmoos renews node, inode, descriptor, executable alias, and absence;
 * Awtsmoos.com gives Linux programs coherent metadata without ambient file authority.
 */
export function createLinuxVirtualFilesystem(options = {}) {
	const entries = new Map();
	const executableSize = Number(options.executableByteLength || 0);
	for (const path of ["/", "/bin", "/usr", "/usr/bin", "/proc", "/proc/self"]) {
		entries.set(path, node(path, "directory", 0));
	}
	for (const path of [
		"/portable-executable",
		"/bin/portable-executable",
		"/proc/self/exe"
	]) {
		entries.set(path, node(path, "file", executableSize));
	}
	for (const [path, input] of Object.entries(options.virtualFiles || {})) {
		entries.set(normalizeLinuxPath(path), customNode(path, input));
	}
	const descriptors = new Map([
		[0, node("stdin", "character", 0)],
		[1, node("stdout", "character", 0)],
		[2, node("stderr", "character", 0)]
	]);
	return {
		descriptors,
		entries,
		lastOperations: []
	};
}

export function normalizeLinuxPath(value, workingDirectory = "/") {
	const text = String(value || "");
	if (!text || text.includes("\u0000")) {
		return null;
	}
	const base = text.startsWith("/")
		? []
		: String(workingDirectory || "/").split("/");
	for (const part of text.split("/")) {
		if (!part || part === ".") {
			continue;
		}
		if (part === "..") {
			base.pop();
			continue;
		}
		base.push(part);
	}
	return `/${base.filter(Boolean).join("/")}` || "/";
}

export function linuxFilesystemSnapshot(filesystem) {
	return Object.freeze({
		descriptors: Object.freeze([...filesystem.descriptors.keys()]),
		entryCount: filesystem.entries.size,
		lastOperations: Object.freeze([...filesystem.lastOperations])
	});
}

function customNode(path, input) {
	const value = input && typeof input === "object" ? input : {};
	const size = Number(value.size ?? value.byteLength ?? 0);
	return Object.freeze({
		...node(normalizeLinuxPath(path), value.type || "file", size),
		mode: Number(value.mode || modeFor(value.type || "file"))
	});
}

function node(path, type, size) {
	return Object.freeze({
		device: 1,
		groupId: 0,
		inode: inodeFor(path),
		mode: modeFor(type),
		nlink: type === "directory" ? 2 : 1,
		path,
		size: Math.max(0, Number(size || 0)),
		timestamp: 1700000000,
		type,
		userId: 0
	});
}

function modeFor(type) {
	if (type === "directory") {
		return DIRECTORY_MODE;
	}
	if (type === "character") {
		return CHARACTER_MODE;
	}
	return REGULAR_MODE;
}

function inodeFor(path) {
	let hash = 2166136261;
	for (const character of String(path)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return hash || 1;
}
