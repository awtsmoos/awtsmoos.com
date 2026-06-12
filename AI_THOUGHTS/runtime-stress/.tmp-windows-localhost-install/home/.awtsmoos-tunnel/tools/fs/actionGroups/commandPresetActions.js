// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath } = require("../pathGuard.js");

const STORE = ".awtsmoos-command-presets.json";

async function readStore(config) {
  const file = safePath(config, STORE);
  try { return JSON.parse(await fsp.readFile(file, "utf8")); }
  catch { return { ok: true, version: 1, presets: {} }; }
}

async function writeStore(config, store) {
  const file = safePath(config, STORE);
  await fsp.writeFile(file, JSON.stringify(store, null, 2), "utf8");
  return file;
}

function fill(value, vars) {
  if (typeof value === "string") return value.replace(/\$\{([A-Za-z0-9_.-]+)\}/g, (_, key) => vars[key] ?? "");
  if (Array.isArray(value)) return value.map(v => fill(v, vars));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v, vars)]));
  return value;
}

function named(payload) {
  const name = payload.name || payload.commandName || payload.presetName;
  if (!name) throw new Error("missing preset name");
  return String(name);
}

function buildCommandPresetActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const runAction = async next => {
    const actions = buildActions(config, next, ws);
    if (!actions[next.action]) throw new Error("Unknown preset action: " + next.action);
    return await actions[next.action]();
  };
  return {
    async commandPresetSave() {
      const store = await readStore(config);
      const name = named(payload);
      store.presets[name] = {
        name,
        description: payload.description || "",
        action: payload.presetAction || payload.call || payload.template?.action || payload.actionToRun,
        payload: payload.template || payload.payload || {},
        defaults: payload.defaults || {},
        createdAt: store.presets[name]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const absolutePath = await writeStore(config, store);
      return { ok: true, action: payload.action, name, path: STORE, absolutePath };
    },
    async commandPresetList() { const store = await readStore(config); return { ok: true, action: payload.action, path: STORE, presets: store.presets }; },
    async commandPresetGet() { const store = await readStore(config); const name = named(payload); return { ok: !!store.presets[name], action: payload.action, name, preset: store.presets[name] || null }; },
    async commandPresetDelete() { const store = await readStore(config); const name = named(payload); const existed = !!store.presets[name]; delete store.presets[name]; const absolutePath = await writeStore(config, store); return { ok: true, action: payload.action, name, existed, absolutePath }; },
    async commandPresetRun() {
      const store = await readStore(config);
      const name = named(payload);
      const preset = store.presets[name];
      if (!preset) return { ok: false, action: payload.action, error: "unknown_preset", name };
      const vars = { ...preset.defaults, ...(payload.vars || {}), ...(payload.params ? JSON.parse(payload.params) : {}) };
      const next = fill({ ...preset.payload, action: preset.action || preset.payload.action }, vars);
      if (payload.dryRun) return { ok: true, action: payload.action, name, dryRun: true, payload: next };
      return { ok: true, action: payload.action, name, result: await runAction(next), payload: next };
    }
  };
}

module.exports = { buildCommandPresetActions };
