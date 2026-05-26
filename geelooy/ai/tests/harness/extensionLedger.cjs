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
    const texts = await Promise.all(Array.from({ length: 16 }, (_, i) => ledger.body(`s${i}`, "text")));
    assert(firsts.every(Boolean), "all first chunks must be readable");
    assert(resumes.every(r => Array.isArray(r.chunks) && r.chunks.every(c => c.index >= 1)), "resume chunks must be cursor-indexed");
    assert(texts.every((t, i) => t === Array.from({ length: 5 }, (_, j) => `s${i}-${j};`).join("")), "all stream text bodies must complete");
    return { streams: 16, firsts: firsts.length, resumes: resumes.length };
  });
}
module.exports = { run };
