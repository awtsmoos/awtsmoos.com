// B"H
import * as RemoteFs from "../remote/remoteFs.js";
import { vfsNode } from "./node.js";
import { unsupported } from "./operations.js";
export function tunnelAdapter(os) { return { id:"tunnel", async list(path) { return (await RemoteFs.list(os, path)).map(x => vfsNode(x.path || `${path}/${x.name}`, x.type === "directory" ? "folder" : "file", x)); }, async read(path) { return await RemoteFs.read(path); }, async stat(path) { return { ok:true, node:vfsNode(path, "file") }; }, async write(path) { return unsupported("write", path); }, async mkdir(path) { return unsupported("mkdir", path); }, async remove(path) { return unsupported("remove", path); } }; }
/** B"H: tunnel VFS mutation waits for a later remote write covenant instead of pretending. */
