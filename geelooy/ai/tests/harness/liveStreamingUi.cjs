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
    assert(bubble.innerHTMLSetCount === 0, "streaming update must not use innerHTML", bubble);
    assert(bubble.childNodes[0] === first, "streaming text node must stay stable", bubble);
    assert(first.textContent.includes("plus"), "stable node should receive new text", first);
    record.streaming = false;
    mod.updateLiveText({}, record, "# hello");
    assert(bubble.innerHTMLSetCount === 1, "final non-streaming update may render markdown once", bubble);
    return { innerHTMLSetCount: bubble.innerHTMLSetCount, stable: true };
  }));

  results.push(await test("stream-resume-store-active-prunes-done-ghosts", async () => {
    const storage = memoryStorage();
    const tabs = memoryStorage();
    const mod = await fresh("js/chatgpt/stream/streamResumeStore.js");
    const store = new mod.StreamResumeStore(storage, tabs);
    store.upsert({ id: "live-1", conversationId: "c1", status: "streaming" });
    store.upsert({ id: "done-1", conversationId: "c2", status: "done", updatedAt: Date.now() - 60000 });
    const active = store.active();
    assert(active.length === 1 && active[0].id === "live-1", "done ghosts must not be active streams", active);
    assert(mod.isLivingStream({ id: "x", status: "done" }) === false, "done stream is not living");
    return { active: active.map(x => x.id) };
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
    querySelector(selector) { return selector === ":scope > .message-live-text" ? this.childNodes.find(n => n.className === "message-live-text") || null : null; },
    classList: { add() {}, remove() {} },
    append(node) { this.childNodes.push(node); },
    set textContent(value) { this.childNodes = []; this._textContent = value; },
    get textContent() { return this._textContent || this.childNodes.map(n => n.textContent || "").join(""); },
    set innerHTML(value) { this.innerHTMLSetCount++; this._innerHTML = value; this.childNodes = []; },
    get innerHTML() { return this._innerHTML || ""; }
  };
  global.document = global.document || {};
  global.document.createElement = tag => ({ tagName: tag.toUpperCase(), className: "", textContent: "" });
  return bubble;
}

function memoryStorage() {
  const map = new Map();
  return { getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) };
}

module.exports = { run };
