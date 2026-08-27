//B"H
/**
 * @file desktopShell.js
 * @brief Optional three-panel shell, disabled unless explicitly requested.
 *
 * Chapter 13: The Awtsmoos burned the heavy rails from the normal embedded
 * forge. A narrow Code browser tab must be chat-first. The palace rails now
 * rise only when the URL carries `awtsmoosAiShell=1`, so experiments cannot
 * crush the living conversation by default.
 */

import { DESKTOP_SHELL, sectionSchema } from "./desktopShellData.js";

/** B"H. Mounts optional desktop rails only by explicit query seal. */
export function mountDesktopShell() {
  syncShell();
  window.addEventListener("awtsmoos-ai-vessel", syncShell);
}

function syncShell() {
  if (shouldShowRails()) return ensureRails();
  removeRails();
}

function shouldShowRails() {
  const params = new URLSearchParams(location.search);
  return document.body.classList.contains("is-awtsmoos-embedded-ai") && params.get("awtsmoosAiShell") === "1";
}

function ensureRails() {
  const container = document.querySelector(".container");
  const main = document.querySelector(".main");
  if (!container || !main || document.querySelector(".desktop-shell-left")) return;
  container.insertBefore(buildLeftRail(), main);
  container.appendChild(buildRightRail());
}

function removeRails() {
  document.querySelector(".desktop-shell-left")?.remove();
  document.querySelector(".desktop-shell-right")?.remove();
}

function buildLeftRail() {
  const rail = document.createElement("aside");
  rail.className = "desktop-shell-left";
  rail.append(...schemaNodes(leftSchema()));
  return rail;
}

function buildRightRail() {
  const rail = document.createElement("aside");
  rail.className = "desktop-shell-right";
  rail.append(...schemaNodes(rightSchema()));
  return rail;
}

function leftSchema() {
  return [
    { className: "desktop-shell-brand", children: [{ text: "✺" }, { tag: "strong", text: "AWTSMOOS" }] },
    { className: "desktop-shell-nav", children: DESKTOP_SHELL.nav.map(([text, icon]) => ({ tag: "button", text: `${icon} ${text}` })) },
    sectionSchema("Project", DESKTOP_SHELL.project),
    { className: "desktop-shell-tunnel", children: [{ tag: "strong", text: "Tunnel Connected" }, { tag: "span", text: "Relay · local by default" }] }
  ];
}

function rightSchema() {
  return [
    sectionSchema("Context", ["Active conversation", "Current provider", "Relay state"]),
    sectionSchema("Tools", DESKTOP_SHELL.tools),
    sectionSchema("Activity", DESKTOP_SHELL.activity)
  ];
}

function schemaNodes(schemas) {
  return schemas.map(schemaToNode);
}

function schemaToNode(schema) {
  if (typeof schema === "string") return document.createTextNode(schema);
  const node = document.createElement(schema.tag || "div");
  if (schema.className) node.className = schema.className;
  if (schema.text) node.textContent = schema.text;
  if (schema.children) node.append(...schema.children.map(schemaToNode));
  return node;
}
