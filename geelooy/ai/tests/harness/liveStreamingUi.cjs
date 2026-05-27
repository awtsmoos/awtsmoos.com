//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  const results = [];
  results.push(await test("streaming-text-keeps-stable-dom-selection", async () => {
    const mod = await fresh("js/render/runtime/liveTextRuntime.js");
    const bubble = fakeBubble();
    const record = { streaming: true, bubble };
    mod.updateLiveText({}, record, "# hello **world**");
    const first = bubble.childNodes[0];
    mod.updateLiveText({}, record, "# hello **world** plus");
    const preview = bubble.childNodes.find(n => n.className === "message-live-markdown-preview");
    assert(bubble.innerHTMLSetCount === 0, "streaming update must not use bubble innerHTML", bubble);
    assert(bubble.childNodes[0] === first, "streaming text node must stay stable", bubble);
    assert(first.textContent.includes("plus"), "stable node should receive new text", first);
    assert(preview?._innerHTML?.includes("<h1>") && preview?._innerHTML?.includes("<strong>world</strong>"), "streaming markdown preview must render incoming markdown", preview);
    record.streaming = false;
    mod.updateLiveText({}, record, "# hello");
    assert(bubble.innerHTMLSetCount === 1, "final non-streaming update may render markdown once", bubble);
    return { innerHTMLSetCount: bubble.innerHTMLSetCount, stable: true, liveMarkdown: true };
  }));

  results.push(await test("stream-resume-store-active-prunes-done-ghosts", async () => {
    const storage = memoryStorage();
    const tabs = memoryStorage();
    const mod = await fresh("js/chatgpt/stream/streamResumeStore.js");
    const store = new mod.StreamResumeStore(storage, tabs);
    store.upsert({ id: "live-1", conversationId: "c1", status: "streaming" });
    store.upsert({ id: "old-live", conversationId: "c1", status: "streaming", updatedAt: Date.now() - 45000 });
    store.upsert({ id: "done-1", conversationId: "c2", status: "done", updatedAt: Date.now() - 60000 });
    store.removeStaleForConversation("c1", { keepRecentMs: 1000 });
    const active = store.active();
    assert(active.some(item => item.id === "live-1") && active.some(item => item.id === "old-live"), "opening an already-streaming chat must not delete living stream rows", active);
    assert(mod.isLivingStream({ id: "x", status: "done" }) === false, "done stream is not living");
    return { active: active.map(x => x.id) };
  }));

  results.push(await test("resume-packets-accept-single-chunk-and-malformed-shapes", async () => {
    const mod = await fresh("js/chatgpt/stream/resumeLoop.js");
    const single = mod.normalizeResumePacket({ chunk: "data:text/plain;base64,YQ==" }, 7);
    const pending = mod.normalizeResumePacket({ pending: true }, 0);
    const malformed = mod.normalizeResumePacket({ hello: "world" }, 0);
    assert(Array.isArray(single.chunks) && single.chunks[0].index === 7, "single resume chunk must normalize into iterable chunks", single);
    assert(pending.pending === true && Array.isArray(pending.chunks), "pending packet must be non-fatal iterable shape", pending);
    assert(malformed.error && Array.isArray(malformed.chunks), "malformed packet must become a status error, not a thrown TypeError", malformed);
    return { single: single.chunks.length, pending: pending.pending, malformed: Boolean(malformed.error) };
  }));

  return {
    ok: results.every(r => r.ok),
    name: "live-streaming-ui-regressions",
    ms: results.reduce((n, r) => n + r.ms, 0),
    facts: Object.fromEntries(results.map(r => [r.name, r.facts]))
  };
}

async function fresh(rel) {
  const href = pathToFileURL(path.join(ROOT, rel)).href + `?h=${Date.now()}${Math.random()}`;
  return import(href);
}

function fakeBubble() {
  const bubble = {
    childNodes: [],
    innerHTMLSetCount: 0,
    dataset: {},
    querySelector(selector) {
      if (selector === ":scope > .message-live-text") return this.childNodes.find(n => n.className === "message-live-text") || null;
      if (selector === ":scope > .message-live-markdown-preview") return this.childNodes.find(n => n.className === "message-live-markdown-preview") || null;
      return null;
    },
    classList: { add() {}, remove() {} },
    append(node) { this.childNodes.push(node); },
    set textContent(value) { this.childNodes = []; this._textContent = value; },
    get textContent() { return this._textContent || this.childNodes.map(n => n.textContent || "").join(""); },
    set innerHTML(value) { this.innerHTMLSetCount++; this._innerHTML = value; this.childNodes = []; },
    get innerHTML() { return this._innerHTML || ""; }
  };
  global.document = global.document || {};
  global.document.createElement = tag => ({ tagName: tag.toUpperCase(), className: "", textContent: "", dataset: {}, childNodes: [], append(node){ this.childNodes.push(node); this.textContent += node.textContent || ""; }, setAttribute(){}, remove(){ this.removed = true; }, set innerHTML(value){ this._innerHTML = value; }, get innerHTML(){ return this._innerHTML || ""; } });
  global.document.createTextNode = text => ({ textContent: text });
  return bubble;
}

function memoryStorage() {
  const map = new Map();
  return { getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) };
}

module.exports = { run };
