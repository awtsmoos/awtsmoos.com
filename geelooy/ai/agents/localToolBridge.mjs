// B"H
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { ALL_TUNNEL_ACTIONS, DEFAULT_SAFE_ACTIONS, describeTool, makeBridgeToolSchemas, toolCallName, toolDetailName } from "../central/index.js";

const require = createRequire(import.meta.url);

/**
 * B"H
 * Chapter 393: The Local Delegate Saw All Names Through One Guarded Door.
 *
 * Local AI agents receive the full generated catalog for discovery and generic
 * tool calls, but only safe essentials are direct tools. Calling any action still
 * reaches `buildActions`, where the real tunnel config decides what may happen.
 */
export class LocalToolBridge {
  constructor({ root = process.cwd(), actions = DEFAULT_SAFE_ACTIONS, allActions = ALL_TUNNEL_ACTIONS } = {}) {
    this.root = root;
    this.actions = actions;
    this.allActions = allActions;
    this.fsActions = this.loadActions();
  }
  schemas() { return makeBridgeToolSchemas(this.actions, this.allActions); }
  async call(name, args = {}) {
    const requested = String(name || args.name || args.action || "").replace(/^[^.]+\./, "");
    if (requested === toolDetailName()) return this.details(args);
    if (requested === toolCallName()) return await this.call(String(args.name || args.action || ""), args.arguments || args.args || {});
    const payload = { ...args, action: requested };
    const table = this.fsActions(payload);
    if (typeof table[requested] !== "function") throw new Error(`Unavailable local tool: ${requested}`);
    return await table[requested]();
  }
  details(args = {}) {
    const names = Array.isArray(args.names) ? args.names.map(String) : [];
    const query = String(args.query || "").toLowerCase();
    const matches = this.allActions.filter(action => names.length ? names.includes(action) : !query || action.toLowerCase().includes(query)).slice(0, 80);
    return { ok: true, directSafe: this.actions, count: this.allActions.length, names: this.allActions, matches, details: matches.map(describeTool), safety: "Final execution is still guarded by buildActions and tunnel config." };
  }
  loadActions() {
    const publicRoot = this.findPublicRoot(this.root);
    const { buildActions } = require(path.join(publicRoot, "apps/tunnel/agent/tools/fs/actions.js"));
    return payload => buildActions(this.config(), payload, null);
  }
  config() { return { root: this.root, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } }; }
  findPublicRoot(start) {
    let dir = path.resolve(start);
    while (dir && dir !== path.dirname(dir)) {
      const direct = path.join(dir, "apps/tunnel/agent/main.js");
      const nested = path.join(dir, "geelooy/apps/tunnel/agent/main.js");
      if (fs.existsSync(direct)) return dir;
      if (fs.existsSync(nested)) return path.join(dir, "geelooy");
      dir = path.dirname(dir);
    }
    throw new Error("Could not locate geelooy public root for LocalToolBridge.");
  }
}
