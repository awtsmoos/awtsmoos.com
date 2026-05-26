//B"H
(function(){
  function chooseAutomationPrompt(graph, context = {}) {
    const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
    if (!nodes.length) return template(context.settings?.prompt || context.prompt || "continue", context);
    const map = new Map(nodes.map(node => [node.id, node]));
    let node = map.get(graph.start) || nodes[0];
    const seen = new Set();
    for (let i = 0; node && i < 50; i++) {
      if (seen.has(node.id)) return "";
      seen.add(node.id);
      if (node.maxTurns && Number(context.turn || 0) > Number(node.maxTurns)) return "";
      if (node.type === "stop") return "";
      if (node.type === "send") return template(node.prompt || context.settings?.prompt || "continue", context);
      if (node.type === "condition") {
        node = map.get(matches(node, context.lastReply || "") ? node.onTrue : node.onFalse);
        continue;
      }
      node = map.get(node.next);
    }
    return "";
  }

  function matches(node, text) {
    let ok = false;
    if (node.regex) {
      try { ok = new RegExp(node.match || "", node.flags || "i").test(text); } catch { ok = false; }
    } else ok = String(text).toLowerCase().includes(String(node.match || "").toLowerCase());
    return node.negate ? !ok : ok;
  }

  function template(text, context) {
    const values = {
      "settings.prompt": context.settings?.prompt || "continue",
      lastReply: context.lastReply || "",
      conversationId: context.conversationId || "",
      turn: String(context.turn || "")
    };
    return String(text || "").replace(/{{\s*([^}]+?)\s*}}/g, (_, key) => values[key] ?? "");
  }

  globalThis.AwtsmoosBgAutomationGraph = { chooseAutomationPrompt };
})();
