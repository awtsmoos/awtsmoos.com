// B"H
import { vfsNode } from "./node.js";
import { unsupported } from "./operations.js";
export function previewAdapter(os) { return { id:"preview", async list() { return os.drives.list().filter(d => d.kind === "preview").map(d => vfsNode(d.root, "preview", d)); }, async read(path) { return { ok:true, content:`Preview object: ${path}` }; }, async stat(path) { return { ok:true, node:vfsNode(path, "preview") }; }, async write(path) { return unsupported("write", path); }, async mkdir(path) { return unsupported("mkdir", path); }, async remove(path) { return unsupported("remove", path); } }; }
/** B"H: preview artifacts are windows, not writable clay; mutation answers honestly. */
