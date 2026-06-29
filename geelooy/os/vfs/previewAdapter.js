// B"H
import { vfsNode } from "./node.js";
export function previewAdapter(os) { return { id:"preview", async list() { return os.drives.list().filter(d => d.kind === "preview").map(d => vfsNode(d.root, "preview", d)); }, async read(path) { return { ok:true, content:`Preview object: ${path}` }; }, async stat(path) { return { ok:true, node:vfsNode(path, "preview") }; } }; }
