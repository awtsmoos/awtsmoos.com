//B"H
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H — Simulates many background extension streams without Chrome.
 * It proves stream ids stay independent, cursors resume, and complete bodies
 * remain intact while the ledger pumps in the background.
 */
async function run() {
  return test("extension-ledger-many-streams", async () => {
    class FileReader { readAsDataURL(blob) { blob.arrayBuffer().then(buffer => { this.result = "data:application/octet-stream;base64," + Buffer.from(buffer).toString("base64"); this.onload?.(); }); } }
    const context = { Blob, FileReader, TextDecoder, Uint8Array, setTimeout, console };
    context.globalThis = context;
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/streamLedger.js"), "utf8"), context);
    const ledger = context.__awtsmoosStreamLedger;
    function response(label) {
      const chunks = Array.from({ length: 5 }, (_, i) => new TextEncoder().encode(`${label}-${i};`));
      let i = 0;
      return { body: { getReader: () => ({ read: async () => i < chunks.length ? { done: false, value: chunks[i++] } : { done: true } }) } };
    }
    for (let i = 0; i < 16; i++) ledger.create(`s${i}`, response(`s${i}`));
    const firsts = await Promise.all(Array.from({ length: 16 }, (_, i) => ledger.read(`s${i}`)));
    const resumes = await Promise.all(Array.from({ length: 16 }, (_, i) => ledger.resume(`s${i}`, 1)));
    const cancelled = ledger.cancel("s7", "user cancelled this one stream");
    const afterCancelResume = await ledger.resume("s8", 1);
    const texts = await Promise.all(Array.from({ length: 16 }, (_, i) => i === 7 ? Promise.resolve("cancelled") : ledger.body(`s${i}`, "text")));
    assert(cancelled?.cancelled === true && cancelled?.done === true, "cancelled stream must be marked cancelled/done without deleting sibling streams", { cancelled });
    assert(afterCancelResume?.id === "s8" && Array.isArray(afterCancelResume.chunks), "sibling stream must remain instantly resumable after another stream is cancelled", { afterCancelResume });
    assert(firsts.every(Boolean), "all first chunks must be readable");
    assert(resumes.every(r => Array.isArray(r.chunks) && r.chunks.every(c => c.index >= 1)), "resume chunks must be cursor-indexed");
    assert(texts.every((t, i) => i === 7 ? t === "cancelled" : t === Array.from({ length: 5 }, (_, j) => `s${i}-${j};`).join("")), "all non-cancelled stream text bodies must complete independently");
    const jected = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/jected.js"), "utf8");
    assert(/unhandledrejection/.test(jected) && /preventDefault\(\)/.test(jected), "injected bridge must suppress expected extension promise rejections");
    const background = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/background.js"), "utf8");
    assert(/cancel-stream/.test(jected) && /awtsFetch\.cancelStream/.test(jected), "page bridge must expose per-stream cancel");
    assert(/cancel-stream/.test(background) && /__awtsmoosStreamLedger\.cancel/.test(background), "background must route per-stream cancel to ledger");
    assert(/extension-timeout/.test(jected) && /awtsmoos-server-feedback/.test(jected), "injected bridge must report timeout feedback instead of silent console spam");
    return { streams: 16, firsts: firsts.length, resumes: resumes.length, cancelled: true, timeoutGuard: true };
  });
}
module.exports = { run };
