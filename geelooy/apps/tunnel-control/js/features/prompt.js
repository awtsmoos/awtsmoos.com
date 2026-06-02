// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { tunnelName } from "../ui/api.js";
import { readLocalSetting, saveLocalSetting } from "../state/storage.js";

const PROMPT_MEMORY = "awtPromptSettings";

/**
 * B"H
 * Chapter 365: The Prompt Scroll Remembered Its Ink After Rain.
 *
 * The Awtsmoos teaches the instruction page to persist like letters carved in
 * living sapphire. Project path, mode, and custom guidance return after refresh;
 * copy is no longer the only ritual, because save now gives a visible seal.
 */
export function promptPage() {
  return h("section", { className: "pane", data: { pane: "prompt" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "GPT / Any AI" }), h("h2", { text: "Agent instructions" })]),
    h("article", { className: "panel stack" }, [
      field("projectPath", "Project path", { value: "." }),
      h("label", {}, ["Prompt mode", h("select", { id: "promptMode" }, [h("option", { value: "general", text: "General" }), h("option", { value: "debug", text: "Debug" }), h("option", { value: "build", text: "Build" })])]),
      area("promptExtra", "Saved custom instruction", ""),
      h("div", { className: "button-row" }, [h("button", { id: "savePromptBtn", className: "primary", text: "Save prompt settings" }), h("button", { id: "copyPromptBtn", text: "Copy prompt" })])
    ]),
    out("promptBox")
  ]);
}
export function buildPrompt({ tunnelName: name, projectPath = ".", mode = "general", extra = "" } = {}) {
  return ['B"H', "Use my Awtsmoos runtime workspace.", `mode: ${mode}`, `tunnelName: ${name || "unbound"}`, `project path: ${projectPath}`, extra.trim() ? "" : null, extra.trim() || null].filter(x => x !== null).join("\n");
}
export async function mountPrompt() {
  await restorePromptSettings();
  const render = () => { $("promptBox").textContent = buildPrompt({ tunnelName: tunnelName(), projectPath: $("projectPath")?.value || ".", mode: $("promptMode")?.value || "general", extra: $("promptExtra")?.value || "" }); };
  const save = async note => { await saveLocalSetting(PROMPT_MEMORY, readPromptSettings()); render(); $("promptBox").textContent += `\n\nSaved: ${note}`; };
  $("projectPath").oninput = render;
  $("promptMode").onchange = render;
  $("promptExtra").oninput = render;
  $("savePromptBtn").onclick = () => save("prompt settings will return after refresh.");
  $("copyPromptBtn").onclick = async () => { await navigator.clipboard.writeText(buildPrompt({ ...readPromptSettings(), tunnelName: tunnelName() })); $("promptBox").textContent += "\n\nCopied prompt to clipboard."; };
  render();
}
async function restorePromptSettings() {
  const saved = await readLocalSetting(PROMPT_MEMORY, { projectPath: ".", mode: "general", extra: "" });
  if ($("projectPath")) $("projectPath").value = saved.projectPath || ".";
  if ($("promptMode")) $("promptMode").value = saved.mode || "general";
  if ($("promptExtra")) $("promptExtra").value = saved.extra || "";
}
function readPromptSettings() { return { projectPath: $("projectPath")?.value || ".", mode: $("promptMode")?.value || "general", extra: $("promptExtra")?.value || "" }; }
