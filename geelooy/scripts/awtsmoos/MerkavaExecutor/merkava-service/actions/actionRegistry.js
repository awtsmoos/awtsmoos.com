// B"H

function filesOf(ctx = {}) {
  ctx.options = ctx.options || {};
  ctx.options.files = ctx.options.files || {};
  return ctx.options.files;
}

function record(ctx = {}, entry = {}) {
  ctx.logs = ctx.logs || [];
  const sealed = { at: Date.now(), ...entry };
  ctx.logs.push(sealed);
  return sealed;
}

function syntaxCheckSource(source = "") {
  try {
    Function(String(source));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message, stack: error.stack };
  }
}

/**
 * B"H
 * Builds a tiny data-driven command registry for the Merkava workflow chariot.
 * The Awtsmoos speaks each step into being: virtual files are written, checked,
 * simulated, logged, and carried forward without Chrome or a physical browser.
 *
 * @param {Function} runOnce Runs one normalized virtual runtime pass.
 * @returns {Object<string, Function>} Workflow actions keyed by declarative names.
 */
export function createActionRegistry(runOnce) {
  return {
    async log(ctx = {}, payload = {}) {
      return record(ctx, { kind: "log", message: payload.message || "", value: payload.value ?? ctx.result ?? null });
    },

    async setFile(ctx = {}, payload = {}) {
      const files = filesOf(ctx);
      const path = payload.path || payload.p || payload.file || ctx.entry || "index.js";
      files[path] = String(payload.content ?? "");
      return record(ctx, { kind: "setFile", path, bytes: Buffer.byteLength(files[path], "utf8") });
    },

    async patchFile(ctx = {}, payload = {}) {
      const files = filesOf(ctx);
      const path = payload.path || payload.p || payload.file || ctx.entry || "index.js";
      const before = String(files[path] || "");
      const find = String(payload.find ?? "");
      const replace = String(payload.replace ?? "");
      const after = payload.regex ? before.replace(new RegExp(find, payload.flags || "g"), replace) : before.split(find).join(replace);
      files[path] = after;
      return record(ctx, { kind: "patchFile", path, changed: before !== after });
    },

    async syntaxCheck(ctx = {}, payload = {}) {
      const files = filesOf(ctx);
      const targets = payload.paths || payload.files || [payload.path || payload.p || ctx.entry || "index.js"];
      const results = [].concat(targets).map(path => ({ path, ...syntaxCheckSource(files[path] || "") }));
      const result = { ok: results.every(item => item.ok), action: "syntaxCheck", results };
      record(ctx, { kind: "syntaxCheck", ok: result.ok, count: results.length });
      return result;
    },

    async simulate(ctx = {}, options = {}) {
      return runOnce({ ...(ctx.options || {}), ...options, files: filesOf(ctx) });
    },

    async runtimeCheck(ctx = {}, options = {}) {
      const result = await runOnce({ ...(ctx.options || {}), ...options, files: filesOf(ctx) });
      record(ctx, { kind: "runtimeCheck", ok: result.ok !== false, entry: options.entry || ctx.entry });
      return result;
    },

    async rerun(ctx = {}) {
      return runOnce({ ...(ctx.options || {}), files: filesOf(ctx) });
    },

    async mutate(ctx = {}, next = {}) {
      ctx.options = { ...(ctx.options || {}), ...next };
      return runOnce(ctx.options);
    },

    async assertOk(ctx = {}, payload = {}) {
      const target = payload.path ? payload.path.split(".").reduce((acc, key) => acc?.[key], ctx) : ctx.result;
      const ok = target?.ok !== false;
      if (!ok && payload.throw !== false) throw new Error(payload.message || "Merkava assertion failed");
      return record(ctx, { kind: "assertOk", ok });
    }
  };
}
