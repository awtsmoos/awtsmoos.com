// B"H
/**
 * @file merkavaBundleEntry.mjs
 * @description Standalone bundle entry for Merkava. Everything routes through
 * the real browser engine (virtual DOM + fetch) — no bytecode VM, no dynamic
 * requires, fully bundleable to a single file.
 *
 *   node merkava.mjs run-js <url>          # page JS errors
 *   node merkava.mjs run-js --js "code"     # snippet via engine-wrapped page
 *   node merkava.mjs --url <url> --out shot.png [--device iphone14] [--full]
 */
import { writeFileSync, readFileSync } from "fs";
import { runPage } from "./merkavaCore.mjs";
import { runPageWithJs } from "./snapshots/jsPageRunner.js";
import { VIEWPORT_PRESETS } from "./snapshots/verifySession.js";

export { runPage, runPageWithJs, VIEWPORT_PRESETS };
export const VERSION = "2.0.0";

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(name);

async function main() {
  const sub = process.argv[2];
  if (sub === "run-js") {
    const target = process.argv[3];
    const jsArg = arg("--js");
    const jsFile = arg("--js-file");
    const htmlArg = arg("--html");
    const fileArg = arg("--file");
    let url = target && !target.startsWith("--") ? target : arg("--url");
    let html = htmlArg || (fileArg ? readFileSync(fileArg, "utf8") : null);
    let js = jsArg || (jsFile ? readFileSync(jsFile, "utf8") : null);
    if (js && !html && !url) {
      // Snippet: wrap in a minimal page so the browser engine runs it.
      html = `<!DOCTYPE html><html><body><script>${js}</script></body></html>`;
      js = null;
    }
    if (!html && !url) {
      console.error("Usage: merkava run-js <url> [--js \"code\" | --html \"...\" | --file f.html]");
      process.exit(1);
    }
    const r = await runPageWithJs({ html: html || undefined, url: url || undefined, waitMs: 4000 });
    for (const l of r.consoleLogs) console.log(`[${l.level}] ${l.text}`);
    if (!r.jsErrors.length) {
      console.log(`OK: ${r.scriptsRun} script(s), ${r.wallMs}ms — no errors`);
    } else {
      for (const e of r.jsErrors) {
        console.log(`ERROR [${e.kind}] ${e.name}: ${e.message} @ ${e.file}${e.line ? ":" + e.line : ""}`);
      }
      console.log(`FAIL: ${r.jsErrors.length} error(s)`);
    }
    process.exit(r.jsErrors.length ? 1 : 0);
  }
  if (sub === "devices") {
    for (const [k, p] of Object.entries(VIEWPORT_PRESETS))
      console.log(`${k.padEnd(10)} ${p.width}x${p.height} @${p.dpr}x  ${p.label}`);
    return;
  }
  // Screenshot: node merkava.mjs --url <url> --out shot.png [--device iphone14] [--full]
  const url = arg("--url");
  const file = arg("--file");
  const htmlArg = arg("--html");
  if (!url && !file && !htmlArg) {
    console.error("Usage: merkava --url <url> --out shot.png [--device iphone14] [--full] | merkava run-js <url> | merkava devices");
    process.exit(1);
  }
  const device = arg("--device");
  const vp = device && VIEWPORT_PRESETS[device] ? VIEWPORT_PRESETS[device] : VIEWPORT_PRESETS.desktop;
  const r = await runPage({
    url: url || undefined,
    html: htmlArg || (file ? readFileSync(file, "utf8") : undefined),
    device: device || undefined,
    viewport: arg("--viewport") || undefined,
    pngLevel: 1,
    waitMs: 4000,
  });
  const out = arg("--out", "/tmp/merkava-shot.png");
  writeFileSync(out, r.png);
  console.log(`OK ${out} ${r.width}x${r.height} ${r.png.length}B in ${r.timingsMs.total}ms (JS: ${r.jsStatus}, errors: ${r.jsErrors.length})`);
  if (r.jsErrors.length) {
    for (const e of r.jsErrors.slice(0, 5))
      console.log(`  JS-ERROR [${e.kind}] ${e.name}: ${String(e.message).slice(0, 120)} @ ${e.file}${e.line ? ":" + e.line : ""}`);
  }
}

const __isMain = (() => {
  try {
    return !!process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
  } catch { return false; }
})();
if (__isMain) main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
