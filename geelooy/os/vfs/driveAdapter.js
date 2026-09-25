//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveAdapter
 * @description Mounts canonical Awtsmoos Drive objects directly into Geelooy OS VFS.
 * The Awtsmoos is not copied when a window changes; Awtsmoos.com lets one file answer
 * Drive and OS through the same backend path, authority, and mutation testimony.
 */
import { createDriveAuthority } from "../drive/driveAuthority.js";
import { driveEntriesFromResponse, driveEntryNode, driveRootNode } from "../drive/driveEntryMapper.js";
import { driveEntryPath, parentDriveEntryPath } from "../drive/drivePath.js";
import {
	createDriveEntry,
	listDriveEntries,
	readDriveBytes,
	runDriveAction,
	writeDriveBytes
} from "../drive/driveTransport.js";
import { operationResult } from "./operations.js";

/** Creates the first-class VFS adapter for signed-in Awtsmoos Drive storage. */
export function driveAdapter(_os, options = {}) {
	const authority = options.authority || createDriveAuthority(options);
	const transport = options.transport || defaultTransport();
	return {
		id: "drive",
		async list(path) {
			const { aliasId } = await authority.current();
			const drivePath = driveEntryPath(path);
			const response = await transport.list(aliasId, drivePath);
			return driveEntriesFromResponse(response).map(entry => driveEntryNode(entry, aliasId));
		},
		async stat(path) {
			const { aliasId } = await authority.current();
			const drivePath = driveEntryPath(path);
			if (!drivePath) return { ok: true, node: driveRootNode(aliasId) };
			const response = await transport.list(aliasId, parentDriveEntryPath(drivePath));
			const entry = driveEntriesFromResponse(response).find(item => String(item.path || "") === drivePath);
			return entry ? { ok: true, node: driveEntryNode(entry, aliasId) } : { ok: false, error: "not_found", path };
		},
		async read(path) {
			const { aliasId } = await authority.current();
			const drivePath = requireEntryPath(path);
			const result = await transport.read(aliasId, drivePath);
			return { ok: true, content: result.content, contentType: result.contentType };
		},
		async write(path, payload = {}) {
			const { aliasId } = await authority.current();
			const drivePath = requireEntryPath(path);
			await transport.write(aliasId, drivePath, payload);
			return operationResult("write", path, { provider: "drive", drivePath });
		},
		async mkdir(path) {
			const { aliasId } = await authority.current();
			const drivePath = requireEntryPath(path);
			await transport.create(aliasId, { path: drivePath, type: "folder" });
			return operationResult("mkdir", path, { provider: "drive", drivePath });
		},
		async remove(path) {
			const { aliasId } = await authority.current();
			const drivePath = requireEntryPath(path);
			await transport.action(aliasId, "trash", { path: drivePath });
			return operationResult("remove", path, { provider: "drive", drivePath, recoverable: true });
		},
		async copy(path, payload = {}) {
			return transfer("copy", path, payload, authority, transport);
		},
		async move(path, payload = {}) {
			return transfer("move", path, payload, authority, transport);
		}
	};
}

async function transfer(action, destinationPath, payload, authority, transport) {
	const { aliasId } = await authority.current();
	const fromPath = requireEntryPath(payload.from);
	const toPath = requireEntryPath(destinationPath);
	await transport.action(aliasId, action, { fromPath, toPath });
	return operationResult(action, destinationPath, { provider: "drive", fromPath, toPath });
}

function requireEntryPath(path) {
	const value = driveEntryPath(path);
	if (!value) throw new Error("The Drive root cannot be used as a file entry.");
	return value;
}

function defaultTransport() {
	return {
		list: listDriveEntries,
		read: readDriveBytes,
		write: writeDriveBytes,
		create: createDriveEntry,
		action: runDriveAction
	};
}
