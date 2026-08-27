// B"H
import { h } from "../ui/core/html.js";
import { PAGE_SPECS } from "./pageSpecs.js";
import { createMeshPanel } from "../runtime/mesh/meshPanel.js";
import { createRemoteDesktopPanel } from "../features/remoteDesktopPanel.js";
/** B"H — Chapter 915: Panes learned to host born panels and rescued controls. */
export function findAppRoot() { return document.querySelector("main") || document.querySelector("#app") || document.querySelector(".app") || document.querySelector(".wrap") || document.querySelector(".container") || document.body; }
function unsafe(node) { return !node || node.closest(".awt-control-shell") || node.matches("html, body, main, #app, .app, .wrap, .container"); }
function blockFor(node) {
  const block = node.closest(".field, .form-row, .control-row, .toolbar, .actions, details, label, .card, .panel");
  return !unsafe(block) && !block.querySelector?.(".awt-control-shell") ? block : node;
}
function moveUnique(dest, node, moved) { if (!unsafe(node) && !moved.has(node)) { moved.add(node); dest.append(node); return true; } return false; }
function adoptControls(dest, spec, moved) {
  let count = 0;
  for (const id of spec.ids || []) { const node = document.getElementById(id); if (node && moveUnique(dest, blockFor(node), moved)) count++; }
  for (const cls of spec.classes || []) for (const node of [...document.getElementsByClassName(cls)]) if (moveUnique(dest, blockFor(node), moved)) count++;
  for (const selector of spec.selectors || []) for (const node of [...document.querySelectorAll(selector)]) if (moveUnique(dest, blockFor(node), moved)) count++;
  return count;
}
function docsLinks(spec) { return h("div", { classes:["awt-link-grid"], children:(spec.links || []).map(url => h("a", { attrs:{ href:url, target:"_blank", rel:"noopener" }, text:url })) }); }
function installCommands() {
  const commands = [["PowerShell","irm https://awtsmoos.com/api/tunnel/install/windows | iex"],["CMD","powershell -ExecutionPolicy Bypass -Command \"irm https://awtsmoos.com/api/tunnel/install/windows | iex\""],["Mac / Linux","curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"]];
  return h("div", { classes:["awt-command-grid"], children:commands.map(([label, command]) => commandCard(label, command)) });
}
function commandCard(label, command) { const pre = h("pre", { text:command }); const copy = h("button", { attrs:{ type:"button" }, text:"Copy" }); copy.addEventListener("click", () => navigator.clipboard.writeText(command)); return h("div", { classes:["awt-command-card"], children:[h("strong", { text:label }), pre, copy] }); }
function bornPanel(spec) { if (spec.key === "mesh") return createMeshPanel(); if (spec.key === "remoteDesktop") return createRemoteDesktopPanel(); return null; }
function emptyPanel() { return h("div", { classes:["awt-empty-dashboard"], children:[h("strong", { text:"Controls not found" }), h("span", { text:"The original controls for this page were not detected in the DOM." })] }); }
function createPane(spec, moved) {
  const body = h("div", { classes:["awt-pane-content"] });
  const count = adoptControls(body, spec, moved); const born = bornPanel(spec);
  if (born) body.append(born); if (spec.commandPage) body.append(installCommands()); if (spec.links) body.append(docsLinks(spec));
  if (!count && !born && !spec.commandPage && !spec.links) body.append(emptyPanel());
  return h("section", { attrs:{ "data-pane":spec.key }, classes:["awt-made-pane"], children:[body] });
}
export function collectPanes() { const moved = new Set(); return PAGE_SPECS.map(spec => createPane(spec, moved)); }
export function createFallbackPane() { return h("section", { attrs:{ "data-pane":"diagnostic" }, children:[h("div", { classes:["awt-pane-content"], children:[h("strong", { text:"Diagnostic" }), h("span", { text:"No controls were detected." })] })] }); }
