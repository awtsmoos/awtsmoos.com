// B"H
import * as RemoteFs from "../remote/remoteFs.js";
import { vfsNode } from "./node.js";
export function tunnelAdapter(os) { return { id:"tunnel", async list(path) { return (await RemoteFs.list(os, path)).map(x => vfsNode(x.path || `${path}/${x.name}`, x.type === "directory" ? "folder" : "file", x)); }, async read(path) { return await RemoteFs.read(path); }, async stat(path) { return { ok:true, node:vfsNode(path, "file") }; } }; }
