// B"H

import { h, field, out, $ } from "../ui/dom.js";
import { tunnelName } from "../ui/api.js";

export function promptPage() {
  return h("section", { className: "pane", data: { pane: "prompt" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "GPT / Any AI" }),
      h("h2", { text: "Agent instructions" })
    ]),

    h("article", { className: "panel stack" }, [
      field("projectPath", "Project path", { value: "." }),
      h("button", { id: "copyPromptBtn", text: "Copy prompt" })
    ]),

    out("promptBox")
  ]);
}

export function buildPrompt({ tunnelName: name, projectPath = ".", mode = "general" } = {}) {
  return [
    'B"H',
    'Use my Awtsmoos runtime workspace.',
    `mode: ${mode}`,
    `tunnelName: ${name || "unbound"}`,
    `project path: ${projectPath}`
  ].join("\n");
}

export function mountPrompt() {
  const render = () => {
    $("promptBox").textContent = buildPrompt({
      tunnelName: tunnelName(),
      projectPath: $("projectPath")?.value || ".",
      mode: "general"
    });
  };

  $("projectPath").oninput = render;

  $("copyPromptBtn").onclick = () => {
    navigator.clipboard.writeText($("promptBox").textContent);
  };

  render();
}
