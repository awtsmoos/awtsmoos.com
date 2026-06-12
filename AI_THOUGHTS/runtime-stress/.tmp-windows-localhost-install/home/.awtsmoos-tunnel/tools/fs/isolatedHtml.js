// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { SANDBOX_ROOT } = require("./isolatedJs.js");
const { staticServerStart, staticServerStop, staticServerLogs } = require("./staticServers.js");
const { handleChrome } = require("../chrome/index.js");

function makeId() {
  return "iso-html-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

async function copyOne(config, sandbox, rel) {
  const src = safePath(config, rel);
  assertNotSecret(config, src);
  const dest = path.join(sandbox, rel);
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(src, dest);
  return path.relative(sandbox, dest).replace(/\\/g, "/");
}

/**
 * B"H
 * Copies selected frontend files into a sandbox, serves them, tests with Chrome, and cleans up.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Smoke-test result.
 */
async function isolatedHtmlTest(config, payload = {}) {
  const sandboxId = payload.sandboxId || makeId();
  const sandbox = path.join(SANDBOX_ROOT, sandboxId);
  const files = Array.isArray(payload.files) ? payload.files : [];
  const copied = [];
  let server = null;

  await fsp.mkdir(sandbox, { recursive: true });

  try {
    for (const rel of files.slice(0, Number(payload.maxFiles || 100))) {
      copied.push(await copyOne(config, sandbox, rel));
    }

    const entry = payload.entry || payload.index || "index.html";
    if (payload.html !== undefined) {
      const entryPath = path.join(sandbox, entry);
      await fsp.mkdir(path.dirname(entryPath), { recursive: true });
      await fsp.writeFile(entryPath, String(payload.html), "utf8");
      if (!copied.includes(entry)) copied.push(entry);
    }

    server = await staticServerStart(config, {
      path: path.relative(config.root, sandbox).replace(/\\/g, "/"),
      port: payload.port || 0,
      index: entry,
      cors: payload.cors === true,
      spaFallback: payload.spaFallback === true
    });

    const urlPath = String(payload.urlPath || "").replace(/^\//, "");
    const url = payload.url || server.url + urlPath;
    const browser = await handleChrome({
      action: "chromeTestUrl",
      url,
      selector: payload.selector || "",
      timeoutMs: payload.timeoutMs || 30000,
      snapshot: payload.snapshot !== false,
      assertNoConsoleErrors: payload.assertNoConsoleErrors === true,
      maxLogs: payload.maxLogs || 300
    });
    const serverLogs = await staticServerLogs({ serverId: server.serverId, maxLogs: 500 });

    return {
      ok: browser.ok !== false,
      action: "isolatedHtmlTest",
      sandboxId,
      sandbox,
      filesCopied: copied.length,
      copied,
      server,
      browser,
      serverLogs
    };
  } finally {
    if (server && payload.keepServer !== true) {
      await staticServerStop({ serverId: server.serverId }).catch(() => {});
    }
    if (payload.keepSandbox !== true) {
      await fsp.rm(sandbox, { recursive: true, force: true }).catch(() => {});
    }
  }
}

module.exports = { isolatedHtmlTest };
