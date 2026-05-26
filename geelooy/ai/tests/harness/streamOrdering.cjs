//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  return test("stream-router-single-assistant-record-order", async () => {
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
  });
}
module.exports = { run };
