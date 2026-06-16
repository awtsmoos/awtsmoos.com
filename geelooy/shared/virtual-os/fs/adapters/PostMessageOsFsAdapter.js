// B"H
import { normalizeVirtualFsAction, VIRTUAL_FS_ACTIONS } from "../actions.js";
import { dirname, normalizeVirtualPath } from "../path.js";
import { failResult, listItem, listResult, okResult } from "../result.js";
import { capabilityReport } from "../capabilities.js";

/**
 * B"H
 * Chapter 50: The old iframe bridge became an adapter instead of a secret tunnel.
 */
export class PostMessageOsFsAdapter {
  constructor({ request, timeoutMs = 10000 } = {}) {
    if (!request) throw new Error("post_message_request_required");
    this.request = request;
    this.timeoutMs = timeoutMs;
  }

  capabilities() { return capabilityReport("postMessageOs", { timeoutMs: this.timeoutMs }); }

  async run(payload = {}) {
    const action = normalizeVirtualFsAction(payload.action || "list");
    try {
      if (action === VIRTUAL_FS_ACTIONS.LIST) return await this.list(payload.path || payload.p || ".");
      if (action === VIRTUAL_FS_ACTIONS.READ) return await this.read(payload.path || payload.p || "README.md");
      if (action === VIRTUAL_FS_ACTIONS.WRITE) return await this.write(payload.path || payload.p || "README.md", payload.content || "");
      if (action === VIRTUAL_FS_ACTIONS.DELETE) return await this.delete(payload.path || payload.p || ".", payload.kind || "file");
      if (action === VIRTUAL_FS_ACTIONS.MAKE_FOLDER) return await this.create(payload.path || payload.p || ".", "directory");
      return failResult(action, "unsupported_post_message_os_action", { availableActions: ["list", "read", "write", "delete", "makeFolder"] });
    } catch (error) {
      return failResult(action, error);
    }
  }

  async list(path = ".") {
    const clean = normalizeVirtualPath(path);
    const response = await this.request("requestFolderList", { path: clean });
    if (response?.error) throw new Error(response.error);
    const items = (response.items || []).map(entry => normalizeEntry(clean, entry));
    return listResult("list", clean, items);
  }

  async read(path = ".") {
    const clean = normalizeVirtualPath(path);
    const response = await this.request("requestFileContent", { path: dirname(clean), fileName: clean.split("/").pop() });
    if (response?.error) throw new Error(response.error);
    return okResult("read", { path: clean, content: response.content ?? "" });
  }

  async write(path = ".", content = "") {
    const clean = normalizeVirtualPath(path);
    const response = await this.request("requestFileWrite", { fullPath: clean, content: String(content ?? "") });
    if (response?.error) throw new Error(response.error);
    return okResult("write", { path: clean, response });
  }

  async create(path = ".", kind = "file") {
    const clean = normalizeVirtualPath(path);
    const response = await this.request("requestItemCreate", { parentPath: dirname(clean), name: clean.split("/").pop(), kind });
    if (response?.error) throw new Error(response.error);
    return okResult(kind === "directory" ? "makeFolder" : "write", { path: clean, response });
  }

  async delete(path = ".", kind = "file") {
    const clean = normalizeVirtualPath(path);
    const response = await this.request("requestItemDelete", { fullPath: clean, kind });
    if (response?.error) throw new Error(response.error);
    return okResult("delete", { path: clean, response });
  }
}

function normalizeEntry(parent, entry) {
  const name = typeof entry === "string" ? entry : entry.name;
  const kind = entry.kind || entry.type || (String(name).endsWith(".folder") ? "directory" : "file");
  return listItem({ name, path: parent === "." ? name : `${parent}/${name}`, kind: kind === "directory" ? "directory" : "file", size: entry.size || 0, lastModified: entry.lastModified || entry.modified || 0, extra: typeof entry === "string" ? {} : entry });
}
