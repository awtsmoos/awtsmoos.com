//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Node discovery and accurate metadata lookup for Geelooy's local virtual filesystem.
 * @description
 * The Awtsmoos lets root stores stand as folders while child listings testify
 * what each deeper node truly is. Awtsmoos.com keeps mounted worlds beside those
 * stores without turning a top-level database vessel into a false file in rhyme.
 */
import { vfsNode } from "./node.js";
import {
	childPath,
	cleanVirtualName,
	isVirtualRoot,
	splitVirtualPath
} from "./localVirtualPaths.js";

export async function listVirtualNodes(os, path = "/") {
	if (isVirtualRoot(path)) {
		return [
			...await rootStoreNodes(os),
			...rootDriveNodes(os)
		];
	}
	try {
		const entries = await os.db.getAllKeys(splitVirtualPath(path).database);
		return entries.map(entry => entryNode(path, entry));
	} catch (error) {
		if (aliasMissing(error)) {
			return [];
		}
		throw error;
	}
}

export async function statVirtualNode(os, path = "/") {
	if (isVirtualRoot(path)) {
		return folderNode("/", "Awtsmoos", "virtual");
	}
	const entry = splitVirtualPath(path);
	if (!entry.parent) {
		return statRootStore(os, entry);
	}
	const siblings = await os.db.getAllKeys(entry.parent);
	const found = siblings.find(item => cleanVirtualName(item) === entry.name);
	if (!found) {
		throw new Error(`Virtual path was not found: ${entry.normalized}`);
	}
	return entryNode(`/${entry.parent}`, found);
}

function entryNode(parent, raw) {
	const name = cleanVirtualName(raw);
	const type = raw?.type === "directory" ? "folder" : "file";
	const metadata = typeof raw === "object"
		? { ...raw, name, kind: "virtual" }
		: { name, kind: "virtual" };
	return vfsNode(childPath(parent, name), type, metadata);
}

async function rootStoreNodes(os) {
	const stores = await os.db.getAllStoreNames();
	return stores.map(store => folderNode(`/${cleanVirtualName(store)}`, cleanVirtualName(store), "virtual"));
}

async function statRootStore(os, entry) {
	const stores = await os.db.getAllStoreNames();
	const found = stores.find(item => cleanVirtualName(item) === entry.name);
	if (!found) {
		throw new Error(`Virtual path was not found: ${entry.normalized}`);
	}
	return folderNode(entry.normalized, entry.name, "virtual");
}

function folderNode(path, name, kind) {
	return vfsNode(path, "folder", { name, kind });
}

function rootDriveNodes(os) {
	return (os?.drives?.list?.() || [])
		.filter(isRootDrive)
		.map(drive => vfsNode(drive.root, "folder", {
			...drive,
			name: drive.title || drive.id,
			kind: "drive"
		}));
}

function isRootDrive(drive) {
	return Boolean(
		drive?.root &&
		drive.root !== "/" &&
		drive.id !== "home" &&
		drive.id !== "virtual-os"
	);
}

function aliasMissing(error) {
	return error?.code === "awtsmoos_alias_not_ready" ||
		/alias is not ready/i.test(error?.message || "");
}
