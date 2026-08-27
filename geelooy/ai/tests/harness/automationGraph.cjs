//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test, makeStorage } = require("./assert.cjs");

/**
 * B"H — Proves the automation graph compiler/executor remains deterministic.
 */
async function run() {
  return test("automation-graph-engine-and-archive", async () => {
    globalThis.localStorage = makeStorage();
    globalThis.window = undefined;
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const graphUrl = pathToFileURL(path.join(ROOT, "js/automation/graphEngine.js")).href + suffix;
    const storeUrl = pathToFileURL(path.join(ROOT, "js/automation/graphStore.js")).href + suffix;
    const archiveUrl = pathToFileURL(path.join(ROOT, "js/automation/messageArchive.js")).href + suffix;
    const { evaluateAutomationGraph } = await import(graphUrl);
    const { AutomationGraphStore } = await import(storeUrl);
    const { AutomationArchiveStore } = await import(archiveUrl);

    const graph = {
      version: 1,
      start: "contains-done",
      nodes: [
        { id: "contains-done", type: "condition", label: "done?", match: "DONE", onTrue: "stop", onFalse: "send-next" },
        { id: "send-next", type: "send", label: "next", prompt: "turn {{turn}} for {{conversationId}}: {{settings.prompt}}", archiveTag: "branch-a" },
        { id: "stop", type: "stop", label: "stop" }
      ]
    };
    const sendDecision = evaluateAutomationGraph(graph, { lastReply: "keep going", conversationId: "c77", turn: 4, settings: { prompt: "continue precisely" } });
    assert(sendDecision.prompt === "turn 4 for c77: continue precisely", "send graph must template prompt", sendDecision);
    assert(sendDecision.archiveTag === "branch-a", "send node must carry archive tag", sendDecision);
    const stopDecision = evaluateAutomationGraph(graph, { lastReply: "DONE now", conversationId: "c77", turn: 5, settings: {} });
    assert(stopDecision.stop === true, "condition true must route to stop", stopDecision);
    const regexGraph = {
      version: 1,
      start: "rx",
      nodes: [
        { id: "rx", type: "condition", regex: true, flags: "i", match: "order\\s+#?\\d+", onTrue: "send-next", onFalse: "stop" },
        { id: "send-next", type: "send", prompt: "regex matched" },
        { id: "stop", type: "stop" }
      ]
    };
    const regexDecision = evaluateAutomationGraph(regexGraph, { lastReply: "Order #771 is ready", settings: {} });
    assert(regexDecision.prompt === "regex matched", "regex condition must route to send node", regexDecision);
    const guardedGraph = {
      version: 1,
      start: "delay-node",
      nodes: [
        { id: "delay-node", type: "delay", delayMs: 25, next: "send-later" },
        { id: "send-later", type: "send", prompt: "later", delayMs: 13, maxTurns: 9, archiveQuery: "tag:alpha" }
      ]
    };
    const guardedDecision = evaluateAutomationGraph(guardedGraph, { lastReply: "", conversationId: "c", turn: 2, settings: {} });
    assert(guardedDecision.prompt === "later" && guardedDecision.delayMs === 13 && guardedDecision.archiveQuery === "tag:alpha", "delay/jump fields must survive graph evaluation", guardedDecision);

    const studioGraph = {
      version: 2,
      start: "architect",
      nodes: [
        { id: "architect", type: "session", role: "architect", outputKey: "concept", prompt: "Make {{settings.prompt}}", next: "writer" },
        { id: "writer", type: "session", role: "writer", outputKey: "scene", prompt: "Use {{memory.concept}}" },
        { id: "compiler", type: "compile", outputKey: "pack", compileTemplate: "{{memory.concept}} + {{memory.scene}}" }
      ]
    };
    const firstStudio = evaluateAutomationGraph(studioGraph, { settings: { prompt: "a film" }, memory: {}, turn: 1 });
    assert(firstStudio.nodeType === "session" && firstStudio.role === "architect" && firstStudio.outputKey === "concept" && firstStudio.next === "writer", "session node must produce worker decision", firstStudio);
    const secondStudio = evaluateAutomationGraph({ ...studioGraph, start: "writer" }, { settings: {}, memory: { concept: "Hidden city" }, turn: 2 });
    assert(secondStudio.prompt.includes("Hidden city") && secondStudio.outputKey === "scene", "session node must template memory inputs", secondStudio);
    const compileStudio = evaluateAutomationGraph({ ...studioGraph, start: "compiler" }, { memory: { concept: "A", scene: "B" }, turn: 3 });
    assert(compileStudio.prompt === "A + B" && compileStudio.outputKey === "pack", "compile node must template memory package", compileStudio);

    const graphStore = new AutomationGraphStore(makeStorage());
    const saved = graphStore.save(graph);
    assert(saved.nodes.length === 3 && graphStore.load().start === "contains-done", "graph store must roundtrip normalized graph");

    const archive = new AutomationArchiveStore(makeStorage());
    await archive.add({ conversationId: "c77", role: "assistant", text: "first", tag: "branch-a" });
    await archive.add({ conversationId: "c77", role: "assistant", text: "second", tag: "branch-a" });
    const list = await archive.list();
    assert(list.length === 2 && list[0].text === "second", "archive fallback must store newest-first messages", { list });
    return { prompt: sendDecision.prompt, archive: list.length, savedNodes: saved.nodes.length };
  });
}
module.exports = { run };
