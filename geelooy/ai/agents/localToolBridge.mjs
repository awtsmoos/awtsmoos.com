// B"H
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { DEFAULT_SAFE_ACTIONS, makeToolSchemas } from "../central/index.js";

const require = createRequire(import.meta.url);

/**
 * B"H
 * Chapter 21: The local tools stood like iron angels around the model fire.
 *
 * This bridge loads the native tunnel action map directly when running inside
 * the repo. It is intentionally local and secret-safe by default, so OpenRouter
 * or Groq agents can call the same Awtsmoos actions without needing ChatGPT.
 */
export class LocalToolBridge {
  constructor({ root = process.cwd(), actions = DEFAULT_SAFE_ACTIONS } = {}) {
    this.root = root;
    this.actions = actions;
    this.fsActions = this.loadActions();
  }

  schemas() { return makeToolSchemas(this.actions); }

  async call(name, args = {}) {
    const action = name || args.action;
    const payload = { ...args, action };
    const table = this.fsActions(payload);
    if (typeof table[action] !== "function") throw new Error(`Unavailable local tool: ${action}`);
    return await table[action]();
  }

  loadActions() {
    const publicRoot = this.findPublicRoot(this.root);
    const { buildActions } = require(path.join(publicRoot, "apps/tunnel/agent/tools/fs/actions.js"));
    return payload => buildActions(this.config(), payload, null);
  }

  config() {
    return { root: this.root, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } };
  }

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
