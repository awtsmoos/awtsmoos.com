// B"H
import { normalizeVirtualFsAction, VIRTUAL_FS_ACTIONS } from "../actions.js";
import { normalizeVirtualPath } from "../path.js";
import { failResult, listItem, listResult, okResult, readResult } from "../result.js";
import { capabilityReport } from "../capabilities.js";
import { commandFail, commandOk } from "../../command/CommandContract.js";

/**
 * B"H
 * Chapter 62: Browser storage commands returned through the shared command gate.
 */
export class BrowserStorageFsAdapter {
  constructor({ storage, storeKey = "awtsmoos.virtualFs.browserStorage.files" } = {}) {
    this.storage = storage || globalThis.localStorage;
    this.storeKey = storeKey;
  }

  capabilities() { return capabilityReport("browserStorage", { storeKey: this.storeKey }); }

  async run(payload = {}) {
    const action = normalizeVirtualFsAction(payload.action || "list");
    try {
      if (action === VIRTUAL_FS_ACTIONS.LIST) return this.list(payload.path || payload.p || ".");
      if (action === VIRTUAL_FS_ACTIONS.TREE) return this.tree(payload.path || payload.p || ".");
      if (action === VIRTUAL_FS_ACTIONS.READ) return this.read(payload.path || payload.p || "README.md", payload);
      if (action === VIRTUAL_FS_ACTIONS.WRITE) return this.write(payload.path || payload.p || "README.md", payload.content || "");
      if (action === VIRTUAL_FS_ACTIONS.DELETE) return this.delete(payload.path || payload.p || ".");
      if (action === VIRTUAL_FS_ACTIONS.MAKE_FOLDER) return this.makeFolder(payload.path || payload.p || ".");
      if (action === VIRTUAL_FS_ACTIONS.BULK) return this.bulk(payload);
      if (action === VIRTUAL_FS_ACTIONS.COMMAND_RUN) return this.command(payload);
      return failResult(action, "unsupported_browser_storage_action", { availableActions: Object.values(VIRTUAL_FS_ACTIONS) });
    } catch (error) {
      return failResult(action, error);
    }
  }

  list(path = ".") {
    const clean = normalizeVirtualPath(path);
    const prefix = clean === "." ? "" : clean + "/";
    const children = new Map();
    for (const file of Object.keys(this.files())) {
      if (prefix && !file.startsWith(prefix)) continue;
      const rest = prefix ? file.slice(prefix.length) : file;
      if (!rest) continue;
      const [first, ...tail] = rest.split("/");
      children.set(first, listItem({ name: first, path: prefix + first, kind: tail.length ? "directory" : "file" }));
    }
    return listResult("list", clean, [...children.values()]);
  }

  tree(path = ".") {
    const clean = normalizeVirtualPath(path);
    const prefix = clean === "." ? "" : clean + "/";
    const rows = Object.keys(this.files()).filter(file => !prefix || file.startsWith(prefix));
    return okResult("tree", { path: clean, treeText: rows.join("\n"), rows });
  }

  read(path, payload = {}) {
    const clean = normalizeVirtualPath(path);
    const content = this.files()[clean];
    if (content === undefined) return failResult("read", "file_not_found", { path: clean });
    return readResult("read", clean, content, payload);
  }

  write(path, content = "") {
    const clean = normalizeVirtualPath(path);
    const files = this.files();
    files[clean] = String(content);
    this.save(files);
    return okResult("write", { path: clean, bytes: new Blob([String(content)]).size });
  }

  makeFolder(path = ".") {
    const clean = normalizeVirtualPath(path);
    return okResult("makeFolder", { path: clean, virtual: true, note: "BrowserStorage adapter records folders implicitly by file paths." });
  }

  delete(path = ".") {
    const clean = normalizeVirtualPath(path);
    const files = this.files();
    let count = 0;
    for (const key of Object.keys(files)) {
      if (key === clean || key.startsWith(clean + "/")) { delete files[key]; count++; }
    }
    this.save(files);
    return okResult("delete", { path: clean, count });
  }

  bulk(payload = {}) {
    const raw = Array.isArray(payload.paths) ? payload.paths : String(payload.paths || payload.files || "").split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
    const files = {};
    for (const path of raw.slice(0, Number(payload.maxFiles || 10))) files[path] = this.read(path, payload);
    return okResult("bulk", { files, count: Object.keys(files).length });
  }

  command(payload = {}) {
    const command = String(payload.command || "pwd").trim();
    const cwd = payload.cwd || ".";
    if (command === "pwd") return commandOk({ command, cwd, stdout: cwd, simulated: true, vessel: "browser-storage" });
    if (command === "ls") return commandOk({ command, cwd, stdout: Object.keys(this.files()).join("\n"), simulated: true, vessel: "browser-storage" });
    return commandFail({ command, cwd, error: "Unsupported browser storage command. Use native tunnel for real shell.", simulated: true, vessel: "browser-storage" });
  }

  files() { return JSON.parse(this.storage.getItem(this.storeKey) || JSON.stringify({ "README.md": "B\"H\nBrowser storage virtual filesystem.\n" })); }
  save(files) { this.storage.setItem(this.storeKey, JSON.stringify(files)); }
}
