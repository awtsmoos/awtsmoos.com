//B"H
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H — The river is not a bucket.
 *
 * These tests simulate the Chrome extension background ledger without Chrome.
 * They prove stream ids stay independent, cursors resume, cancel touches only
 * one stream, full bodies remain intact, and—most importantly—the first chunk
 * can be read before the upstream response has finished.
 */
async function run() {
  const results = [];
  results.push(await test("extension-ledger-many-streams", async () => {
    const { ledger } = loadLedger();
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
    assertBridgeContracts();
    return { streams: 16, firsts: firsts.length, resumes: resumes.length, cancelled: true, timeoutGuard: true };
  }));

  results.push(await test("extension-ledger-first-chunk-before-full-body", async () => {
    const { ledger } = loadLedger();
    const source = controlledResponse();
    ledger.create("live", source.response);
    const firstPromise = ledger.read("live");
    source.push("first-");
    const first = await firstPromise;
    const statsAfterFirst = ledger.stats("live");
    assert(decodeDataUrl(first) === "first-", "first chunk must be readable as soon as it arrives", { first: decodeDataUrl(first), statsAfterFirst });
    assert(statsAfterFirst.done === false, "first read must happen before upstream stream is done", { statsAfterFirst });
    const bodyPromise = ledger.body("live", "text");
    let settled = false;
    bodyPromise.then(() => { settled = true; });
    await Promise.resolve();
    assert(settled === false, "full body must still wait while live stream is open", { settled });
    source.push("second-");
    source.close();
    const body = await bodyPromise;
    assert(body === "first-second-", "full body must finish after later chunks and close", { body });
    return { first:"first-", doneBeforeBody:false, body };
  }));

  return { ok: results.every(r => r.ok), name: "extension-ledger-many-streams", ms: results.reduce((n, r) => n + r.ms, 0), facts: Object.fromEntries(results.map(r => [r.name, r.facts])), error: results.find(r => !r.ok)?.error };
}

function loadLedger() {
  class FileReader { readAsDataURL(blob) { blob.arrayBuffer().then(buffer => { this.result = "data:application/octet-stream;base64," + Buffer.from(buffer).toString("base64"); this.onload?.(); }); } }
  const context = { Blob, FileReader, TextDecoder, Uint8Array, TextEncoder, setTimeout, clearTimeout, console };
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/streamLedger.js"), "utf8"), context);
  return { context, ledger: context.__awtsmoosStreamLedger };
}

function response(label) {
  const chunks = Array.from({ length: 5 }, (_, i) => new TextEncoder().encode(`${label}-${i};`));
  let i = 0;
  return { body: { getReader: () => ({ read: async () => i < chunks.length ? { done: false, value: chunks[i++] } : { done: true } }) } };
}

function controlledResponse() {
  const encoder = new TextEncoder();
  const waits = [];
  const values = [];
  let closed = false;
  function flush() { while (waits.length && (values.length || closed)) waits.shift()(next()); }
  function next() { return values.length ? { done: false, value: encoder.encode(values.shift()) } : { done: true }; }
  return {
    response: { body: { getReader: () => ({ read: () => values.length || closed ? Promise.resolve(next()) : new Promise(resolve => waits.push(resolve)), cancel: () => { closed = true; flush(); } }) } },
    push(text) { values.push(text); flush(); },
    close() { closed = true; flush(); }
  };
}

function decodeDataUrl(url = "") { return Buffer.from(String(url).split(",").pop() || "", "base64").toString("utf8"); }

function assertBridgeContracts() {
  const jected = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/jected.js"), "utf8");
  const background = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/background.js"), "utf8");
  assert(/unhandledrejection/.test(jected) && /preventDefault\(\)/.test(jected), "injected bridge must suppress expected extension promise rejections");
  assert(/cancel-stream/.test(jected) && /awtsFetch\.cancelStream/.test(jected), "page bridge must expose per-stream cancel");
  assert(/cancel-stream/.test(background) && /__awtsmoosStreamLedger\.cancel/.test(background), "background must route per-stream cancel to ledger");
  assert(/extension-timeout/.test(jected) && /awtsmoos-server-feedback/.test(jected), "injected bridge must report timeout feedback instead of silent console spam");
}

module.exports = { run };
