//B"H
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { pathToFileURL } = require("url");
const { ROOT, PROJECT, assert, test } = require("./assert.cjs");

async function run() {
  const results = [];
  results.push(await test("stream-router-single-assistant-record-order", async () => {
    globalThis.crypto = globalThis.crypto || { randomUUID: () => `id-${Math.random()}` };
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const { StreamRouter } = await import(pathToFileURL(path.join(ROOT, "js/app/streamRouter.js")).href + suffix);
    const records = [];
    const renderer = {
      records,
      add(input) {
        const id = `record-${records.length + 1}`;
        const shell = { classList: { contains: () => false }, dataset: { messageId: id }, isConnected: true };
        const record = { id, shell, input, text: "", events: [] };
        records.push(record);
        return record;
      },
      setRecordEvents(id, events) {
        const record = records.find(item => item.id === id);
        record.events.push(...events);
      },
      async updateRecord(id, packet) {
        const record = records.find(item => item.id === id);
        record.text += packet?.message?.content?.parts?.[0] || packet?.data?.message?.content?.parts?.[0] || packet?.text || "";
      },
      finalizeLiveRecords() { this.finalized = true; }
    };
    const router = new StreamRouter(renderer);
    await router.route({ event: "message", data: { message: { id: "thought-1", author: { role: "assistant" }, channel: "analysis", content: { content_type: "thoughts", thoughts: [{ summary: "thinking" }] }, metadata: { is_thinking_preamble_message: true } } } });
    await router.route({ message: { author: { role: "assistant" }, content: { parts: ["final text"] } } });
    await router.finish({ dataNoJSON: "[DONE]" });
    assert(records.length === 1, "stream router must create exactly one assistant record for events and text", { length: records.length, records });
    assert(records[0].events.length >= 1, "single record must keep streamed events", { records });
    assert(records[0].text.includes("final text"), "single record must keep final text", { records });
    assert(renderer.finalized === true, "stream must finalize", { finalized: renderer.finalized });
    return { records: records.length, events: records[0].events.length, text: records[0].text };
  }));

  results.push(await test("tool-complete-packets-do-not-finalize-before-final-text", async () => {
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const { packetsToDeltas } = await import(pathToFileURL(path.join(ROOT, "js/render/worker/streamDelta.js")).href + suffix);
    const deltas = packetsToDeltas([
      { data: { type: "tool_result.complete", status: "complete", message: { id: "tool-1", author: { role: "assistant" }, content: { content_type: "tool_result", result: { ok: true } }, metadata: { command: "grep" } } } },
      { data: { message: { id: "final-1", author: { role: "assistant" }, content: { content_type: "text", parts: ["final answer"] }, metadata: {} } } },
      { dataNoJSON: "[DONE]" }
    ]);
    assert(deltas[0]?.kind === "event", "tool complete packet must stay an event", { deltas });
    assert(deltas[1]?.kind === "text" && /final answer/.test(deltas[1].text), "final assistant text must stay after tool events", { deltas });
    assert(deltas[2]?.kind === "done", "only literal [DONE] may become done", { deltas });
    return { order: deltas.map(d => d.kind).join(" > ") };
  }));

  results.push(await test("background-automation-mirror-preserves-tool-event-packets", async () => {
    const extensionRoot = path.join(PROJECT, "geelooy/scripts/tricks/extensions/server/bgAutomation");
    const compatibilitySource = fs.readFileSync(path.join(extensionRoot, "streamCompatibility.js"), "utf8");
    const source = fs.readFileSync(path.join(extensionRoot, "sendVerifier.js"), "utf8");
    const packets = [];
    const context = {
      console,
      crypto:{ randomUUID:() => "uuid-test" },
      TextDecoder,
      fetch: async () => { throw new Error("not used"); },
      globalThis:null,
      AwtsmoosBgSettledConversationPoller:{ messageText: msg => (msg?.content?.parts || []).join("") }
    };
    context.globalThis = context;
    vm.runInNewContext(compatibilitySource, context, { filename:"streamCompatibility.js" });
    vm.runInNewContext(source, context, { filename:"sendVerifier.js" });
    const textPacket = JSON.stringify({ conversation_id:"c1", message:{ id:"a1", author:{ role:"assistant" }, content:{ content_type:"text", parts:["hello"] }, metadata:{} } });
    const toolPacket = JSON.stringify({ conversation_id:"c1", type:"tool_result.complete", message:{ id:"tool1", author:{ role:"assistant" }, content:{ content_type:"tool_result", result:{ ok:true } }, metadata:{ command:"grep" } } });
    let state = { buffer:"", text:"", messageId:"", conversationId:"", seq:0 };
    state = context.AwtsmoosBgSendVerifier.parseChunk(`data: ${textPacket}\n\n`, state, p => packets.push(p));
    state = context.AwtsmoosBgSendVerifier.parseChunk(`data: ${toolPacket}\n\n`, state, p => packets.push(p));
    assert(packets.length === 2, "two compact mirror packets should be emitted", { packets });
    assert(packets[0].packet.message.content.parts[0] === "hello", "fresh text packet should render as assistant text", { packets });
    assert(!packets[1].packet.message.content.parts, "tool packet must not duplicate previous assistant text", { packets });
    assert(packets[1].packet.message.content.content_type === "tool_result", "tool packet must preserve compact tool-result content", { packets });
    return { packets: packets.length, secondType: packets[1].packet.message.content.content_type };
  }));

  return {
    ok: results.every(r => r.ok),
    name: "stream-router-single-assistant-record-order",
    ms: results.reduce((n, r) => n + r.ms, 0),
    facts: Object.fromEntries(results.map(r => [r.name, r.facts]))
  };
}
module.exports = { run };
