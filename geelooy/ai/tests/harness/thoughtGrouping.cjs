//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  return test("thought-text-stands-alone-actions-group-after", async () => {
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const { envelopeThoughtEvents } = await import(pathToFileURL(path.join(ROOT, "js/render/runtime/thoughtEnvelope.js")).href + suffix);
    const events = [
      { kind: "thinking", label: "Analysis", text: "first thought", raw: { id: "t1" } },
      { kind: "tool_call", label: "search", text: "", raw: { id: "a1" } },
      { kind: "tool_result", label: "result", text: "", raw: { id: "a2" } },
      { kind: "status", label: "message_stream_complete", text: "", raw: { id: "s1", type: "message_stream_complete" } },
      { kind: "thinking", label: "Analysis", text: "second thought", raw: { id: "t2" } },
      { kind: "awtsmoos_tool", label: "read", text: "", raw: { id: "a3" } }
    ];
    const out = envelopeThoughtEvents(events);
    assert(out.length === 4, "thought grouping should become text, action group, text, action group", out);
    assert(out[0].raw.standaloneThoughtText === true && out[0].text === "first thought", "first text thought must stand alone", out[0]);
    assert(out[1].raw.groupedThoughtEnvelope === true && out[1].raw.events.length === 3, "actions/status after first thought must group", out[1]);
    assert(out[2].raw.standaloneThoughtText === true && out[2].text === "second thought", "second text thought must start a new standalone node", out[2]);
    assert(out[3].raw.groupedThoughtEnvelope === true && out[3].raw.events.length === 1, "actions after second thought must group", out[3]);
    return { shape: out.map(event => event.raw.groupedThoughtEnvelope ? "actions" : "thought").join(" > ") };
  });
}
module.exports = { run };
