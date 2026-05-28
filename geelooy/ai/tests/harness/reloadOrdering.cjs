//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test, makeStorage } = require("./assert.cjs");

/**
 * B"H — Guards the refresh covenant and send-vs-switch race.
 */
async function run() {
  const results = [];
  results.push(await test("reload-full-history-before-stream-resume", async () => {
    installBrowserGlobals("?awtsmoosConversation=conv-reload");
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const storeUrl = pathToFileURL(path.join(ROOT, "js/chatgpt/stream/streamResumeStore.js")).href + suffix;
    const walkUrl = pathToFileURL(path.join(ROOT, "js/chatgpt/conversations/history/walkConversation.js")).href + suffix;
    const { StreamResumeStore } = await import(storeUrl);
    const { walkConversationNodes } = await import(walkUrl);
    const storage = makeStorage();
    const store = new StreamResumeStore(storage, makeStorage());
    const conversationId = "conv-reload";
    const now = Date.now();
    storage.setItem("awtsmoos.activeStreams.v2", JSON.stringify([
      { id: "old-visible", conversationId, status: "streaming", updatedAt: now - 120000, createdAt: now - 120000, cursor: 3 },
      { id: "fresh-visible", conversationId, status: "streaming", updatedAt: now - 500, createdAt: now - 500, cursor: 9 },
      { id: "old-other", conversationId: "other", status: "streaming", updatedAt: now - 120000, createdAt: now - 120000, cursor: 1 },
      { id: "done-visible", conversationId, status: "done", updatedAt: now, createdAt: now, cursor: 99 }
    ]));
    store.removeStaleForConversation(conversationId, { keepRecentMs: 30000 });
    const remaining = store.list().map(item => item.id);
    assert(remaining.join(",") === "fresh-visible,old-other", "reload must purge stale same-conversation streams before resume", { remaining });
    const nodes = walkConversationNodes({
      current_node: "assistant-2",
      mapping: {
        root: { id: "root", parent: null, message: { id: "m-root" } },
        user: { id: "user", parent: "root", message: { id: "m-user" } },
        "assistant-1": { id: "assistant-1", parent: "user", message: { id: "m-a1" } },
        "assistant-2": { id: "assistant-2", parent: "assistant-1", message: { id: "m-a2" } },
        branch: { id: "branch", parent: "user", message: { id: "m-branch" } }
      }
    });
    const chain = nodes.map(node => node.id);
    const order = nodes.map(node => node.message.__awtsmoosHistoryIndex);
    assert(chain.join(",") === "root,user,assistant-1,assistant-2", "history reload must follow current_node ancestry only", { chain });
    assert(order.join(",") === "0,1,2,3", "history nodes must receive stable monotonic order", { order });
    return { remaining, chain, order };
  }));

  results.push(await test("send-cancels-stale-history-load-before-incoming-sparks", async () => {
    installBrowserGlobals("?awtsmoosConversation=c-race&awtsmoosAi=chatgpt");
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const { ConversationController } = await import(pathToFileURL(path.join(ROOT, "js/app/conversationController.js")).href + suffix);
    let resolveHistory;
    const historyPromise = new Promise(resolve => { resolveHistory = resolve; });
    const calls = [];
    const renderer = fakeRenderer(calls);
    const service = {
      getConversation: () => historyPromise,
      promptFunction: async (prompt, options = {}) => {
        calls.push(["prompt", prompt, options.conversationId]);
        options.onstream?.({ conversation_id: options.conversationId, message: { id: "a-live", author: { role: "assistant" }, content: { parts: ["live answer"] } } });
        const packet = { conversation_id: options.conversationId, message: { id: "a-live", author: { role: "assistant" }, content: { parts: ["live answer"] } } };
        await options.ondone?.(packet);
        return packet;
      }
    };
    const controller = new ConversationController({ aiHandler: { getActiveService: async () => service }, renderer, serviceSelect: { value: "test" } });
    const load = controller.loadConversation("c-race").catch(error => { throw error; });
    await Promise.resolve();
    await controller.send("new user text");
    resolveHistory([{ message: { author: { role: "assistant" }, content: { parts: ["old history should not overwrite"] } } }]);
    await load;
    const loadedAfterSend = calls.some(item => item[0] === "loadMessages");
    const userSent = calls.some(item => item[0] === "add" && /new user text/.test(item[1]));
    const assistantAnswered = calls.some(item => item[0] === "update" && /live answer/.test(item[2]));
    assert(!loadedAfterSend, "late history load must not overwrite an in-flight manual send", { calls });
    assert(userSent && assistantAnswered, "manual send should still render user and assistant while old load resolves", { calls });
    return { loadedAfterSend, userSent, assistantAnswered, calls: calls.map(x => x[0]) };
  }));

  results.push(await test("failed-stream-post-becomes-visible-error-not-incoming-sparks", async () => {
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const { logStream } = await import(pathToFileURL(path.join(ROOT, "js/chatgpt/stream/logStream.js")).href + suffix);
    let threw = false;
    try { await logStream({ ok: false, status: 429, text: async () => "rate limited" }, () => null, {}); }
    catch (error) { threw = /429/.test(error.message) && /rate limited/.test(error.message); }
    assert(threw, "failed ChatGPT POST must throw a visible stream error instead of leaving incoming sparks", { threw });
    return { threw };
  }));

  return { ok: results.every(r => r.ok), name: "reload-full-history-before-stream-resume", ms: results.reduce((n, r) => n + r.ms, 0), facts: Object.fromEntries(results.map(r => [r.name, r.facts])) };
}

function installBrowserGlobals(search = "") {
  globalThis.localStorage = makeStorage();
  globalThis.sessionStorage = makeStorage();
  globalThis.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
  globalThis.dispatchEvent = () => null;
  const body = { toggleAttribute() {} };
  globalThis.document = { body, createElement: tag => fakeNode(tag) };
  globalThis.window = globalThis;
  globalThis.location = { pathname: "/ai", search };
  globalThis.history = { pushState(_state, _title, url) { const u = String(url); const q = u.includes("?") ? u.slice(u.indexOf("?")) : ""; globalThis.location.search = q; } };
}

function fakeNode(tag = "div") {
  return { tagName: tag.toUpperCase(), className: "", textContent: "", children: [], dataset: {}, setAttribute() {}, remove() { this.removed = true; }, prepend(node) { this.children.unshift(node); }, append(node) { this.children.push(node); }, querySelector() { return null; } };
}

function fakeRenderer(calls) {
  const records = [];
  return {
    records,
    chatBox: fakeNode("div"),
    clear() { calls.push(["clear"]); records.length = 0; },
    async loadMessages(messages) { calls.push(["loadMessages", messages.length]); },
    add(input) {
      const id = `r${records.length + 1}`;
      const text = input?.message?.content?.parts?.join?.("\n") || "";
      const shell = { dataset: { messageId: id }, classList: { contains: () => false }, isConnected: true, querySelector: () => null };
      const record = { id, text, message: input.message, shell, events: [], loading: Boolean(input.awtsmoosLoading), streaming: Boolean(input.awtsmoosLoading) };
      records.push(record);
      calls.push(["add", text, input.awtsmoosLoading ? "loading" : "message"]);
      return record;
    },
    setRecordEvents(id, events) { calls.push(["events", id, events.length]); },
    async updateRecord(id, packet) { const text = packet?.message?.content?.parts?.[0] || packet?.data?.message?.content?.parts?.[0] || packet?.text || ""; calls.push(["update", id, text]); const rec = records.find(r => r.id === id); if (rec) rec.text = text; },
    finalizeLiveRecords() { calls.push(["finalize"]); },
    refreshLive() {},
    forceScrollDown() {},
    forceScrollDownSoon() {},
    showError(title, error) { calls.push(["error", title, String(error?.message || error)]); }
  };
}

module.exports = { run };
