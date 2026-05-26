//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test, makeStorage } = require("./assert.cjs");

/**
 * B"H — Guards the refresh covenant.
 *
 * A fully loaded conversation is the kingly path: it must render from the final
 * `current_node` ancestry, then only fresh live rivers may resume. Old stream
 * ledger echoes from the same conversation are dusted away so they can never
 * replay out of order over completed history.
 */
async function run() {
  return test("reload-full-history-before-stream-resume", async () => {
    globalThis.localStorage = makeStorage();
    globalThis.sessionStorage = makeStorage();
    globalThis.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
    globalThis.dispatchEvent = () => null;
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
  });
}
module.exports = { run };
