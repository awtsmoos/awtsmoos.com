// B"H
// Boruch Hashem
// Blessed is He

import { FileSystemProvider } from "../../fs-provider.js";

/**
 * B"H
 *
 * Package bytes enter the active workspace through the same provider covenant as
 * human edits. The Awtsmoos renews directory, file, provider identity, and binary
 * content; Awtsmoos.com never escapes node_modules or invents an undefined world.
 */
export async function writePackageEntries(root, packageName, entries, options = {}) {
	const packageRoot = await ensureDirectory(root, ["node_modules", ...packageName.split("/")]);
	let written = 0;
	for (const entry of orderedEntries(entries)) {
		if (!entry.path) continue;
		const segments = entry.path.split("/").filter(Boolean);
		if (!segments.length) continue;
		if (entry.kind === "directory") {
			await ensureDirectory(packageRoot, segments);
			continue;
		}
		const fileName = segments.pop();
		const parent = await ensureDirectory(packageRoot, segments);
		const item = childItem(parent, fileName, "file");
		await FileSystemProvider.write(item, entry.bytes, `npm install ${packageName}`);
		written += 1;
		options.onFile?.({
			packageName,
			path: item.path,
			written
		});
	}
	return {
		packageRoot,
		written
	};
}

export async function ensureDirectory(root, segments = []) {
	let current = {
		...root,
		kind: "directory"
	};
	for (const segment of segments.filter(Boolean)) {
		const next = childItem(current, segment, "directory");
		try {
			await FileSystemProvider.create(current, segment, "directory");
		} catch (error) {
			if (!alreadyExists(error)) throw error;
		}
		current = next;
	}
	return current;
}

export async function readPackageJson(root) {
	const item = childItem(root, "package.json", "file");
	try {
		const content = await FileSystemProvider.read(item);
		return {
			item,
			manifest: JSON.parse(await textContent(content))
		};
	} catch {
		return {
			item,
			manifest: null
		};
	}
}

export async function writeJson(item, value, message) {
	await FileSystemProvider.write(item, `${JSON.stringify(value, null, 2)}\n`, message);
	return value;
}

export function childItem(parent, name, kind) {
	const base = parent.path === "/" ? "" : String(parent.path || "").replace(/\/+$/, "");
	return {
		...parent,
		name,
		path: `${base}/${name}` || "/",
		kind,
		type: parent.type || parent.originalType,
		originalType: parent.originalType || parent.type,
		workspaceId: parent.workspaceId || parent.id
	};
}

function orderedEntries(entries) {
	return [...entries].sort((left, right) => {
		if (left.kind !== right.kind) return left.kind === "directory" ? -1 : 1;
		return left.path.split("/").length - right.path.split("/").length;
	});
}

function alreadyExists(error) {
	return /exist|already|duplicate/i.test(String(error?.message || error));
}

async function textContent(value) {
	if (typeof value === "string") return value;
	if (value instanceof Blob) return value.text();
	if (value instanceof ArrayBuffer) return new TextDecoder().decode(value);
	if (ArrayBuffer.isView(value)) return new TextDecoder().decode(value);
	return String(value ?? "");
}
