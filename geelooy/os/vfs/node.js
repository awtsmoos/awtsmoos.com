// B"H
import { stableId } from "../graph/id.js";
export function vfsNode(path, type = "file", data = {}) { return { id:stableId(type, path), type, path, name:data.name || path.split("/").filter(Boolean).pop() || "/", size:data.size || 0, mtime:data.mtime || new Date().toISOString(), data }; }
