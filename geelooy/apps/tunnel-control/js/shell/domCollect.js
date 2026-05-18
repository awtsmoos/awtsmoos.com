
// B"H

import { h } from "../ui/core/html.js";
import { PAGE_SPECS } from "./pageSpecs.js";
import { createMeshPanel } from "../runtime/mesh/meshPanel.js";

/**
 * B"H
 * Finds the current app root.
 *
 * @returns {HTMLElement} App root.
 */
export function findAppRoot() {
  return document.querySelector("main") ||
    document.querySelector("#app") ||
    document.querySelector(".app") ||
    document.querySelector(".wrap") ||
    document.querySelector(".container") ||
    document.body;
}

/**
 * B"H
 * Returns true if a node should not be adopted.
 *
 * @param {Element|null} node Candidate node.
 * @returns {boolean} Whether node is unsafe.
 */
function unsafe(node) {
  if (!node) return true;
  if (node.closest(".awt-control-shell")) return true;
  if (node.matches("html, body, main, #app, .app, .wrap, .container")) return true;
  return false;
}

/**
 * B"H
 * Finds a reasonable movable block for a control.
 *
 * @param {Element} node Control node.
 * @returns {Element} Movable node.
 */
function blockFor(node) {
  const block = node.closest(
    ".field, .form-row, .control-row, .toolbar, .actions, details, label, .card, .panel"
  );

  if (!unsafe(block) && !block.querySelector?.(".awt-control-shell")) {
    return block;
  }

  return node;
}

/**
 * B"H
 * Moves one unique node into the destination.
 *
 * @param {HTMLElement} dest Destination.
 * @param {Element|null} node Node.
 * @param {Set<Element>} moved Moved set.
 * @returns {void}
 */
function moveUnique(dest, node, moved) {
  if (unsafe(node) || moved.has(node)) return;

  moved.add(node);
  dest.append(node);
}

/**
 * B"H
 * Adds all controls matching IDs/classes/selectors for a page.
 *
 * @param {HTMLElement} dest Destination.
 * @param {object} spec Page spec.
 * @param {Set<Element>} moved Moved set.
 * @returns {number} Count moved.
 */
function adoptControls(dest, spec, moved) {
  let count = 0;

  for (const id of spec.ids || []) {
    const node = document.getElementById(id);
    const block = node ? blockFor(node) : null;

    if (block && !moved.has(block)) {
      moveUnique(dest, block, moved);
      count++;
    }
  }

  for (const cls of spec.classes || []) {
    for (const node of Array.from(document.getElementsByClassName(cls))) {
      const block = blockFor(node);

      if (block && !moved.has(block)) {
        moveUnique(dest, block, moved);
        count++;
      }
    }
  }

  for (const selector of spec.selectors || []) {
    for (const node of Array.from(document.querySelectorAll(selector))) {
      const block = blockFor(node);

      if (block && !moved.has(block)) {
        moveUnique(dest, block, moved);
        count++;
      }
    }
  }

  return count;
}

/**
 * B"H
 * Creates links for docs page.
 *
 * @param {object} spec Page spec.
 * @returns {HTMLElement} Links.
 */
function docsLinks(spec) {
  return h("div", {
    classes: ["awt-link-grid"],
    children: (spec.links || []).map(url => h("a", {
      attrs: {
        href: url,
        target: "_blank",
        rel: "noopener"
      },
      text: url
    }))
  });
}

/**
 * B"H
 * Creates install command cards.
 *
 * @returns {HTMLElement} Install cards.
 */
function installCommands() {
  const commands = [
    ["PowerShell", "irm https://awtsmoos.com/api/tunnel/install/windows | iex"],
    ["CMD", "powershell -ExecutionPolicy Bypass -Command \"irm https://awtsmoos.com/api/tunnel/install/windows | iex\""],
    ["Mac / Linux", "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"]
  ];

  return h("div", {
    classes: ["awt-command-grid"],
    children: commands.map(([label, command]) => {
      const pre = h("pre", { text: command });
      const copy = h("button", { attrs: { type: "button" }, text: "Copy" });

      copy.addEventListener("click", () => navigator.clipboard.writeText(command));

      return h("div", {
        classes: ["awt-command-card"],
        children: [
          h("strong", { text: label }),
          pre,
          copy
        ]
      });
    })
  });
}

/**
 * B"H
 * Creates one page pane.
 *
 * @param {object} spec Page spec.
 * @param {Set<Element>} moved Moved nodes.
 * @returns {HTMLElement} Pane.
 */
function createPane(spec, moved) {
  const body = h("div", { classes: ["awt-pane-content"] });
  const count = adoptControls(body, spec, moved);

  if (spec.key === "mesh") body.append(createMeshPanel());
  if (spec.commandPage) body.append(installCommands());
  if (spec.links) body.append(docsLinks(spec));

  if (!count && !spec.commandPage && !spec.links) {
    body.append(h("div", {
      classes: ["awt-empty-dashboard"],
      children: [
        h("strong", { text: "Controls not found" }),
        h("span", { text: "The original controls for this page were not detected in the DOM." })
      ]
    }));
  }

  return h("section", {
    attrs: { "data-pane": spec.key },
    classes: ["awt-made-pane"],
    children: [body]
  });
}

/**
 * B"H
 * Creates focused panes from old live controls.
 *
 * @returns {HTMLElement[]} Pane nodes.
 */
export function collectPanes() {
  const moved = new Set();
  return PAGE_SPECS.map(spec => createPane(spec, moved));
}

/**
 * B"H
 * Kept as a defensive fallback.
 *
 * @returns {HTMLElement} Fallback pane.
 */
export function createFallbackPane() {
  return h("section", {
    attrs: { "data-pane": "diagnostic" },
    children: [
      h("div", {
        classes: ["awt-pane-content"],
        children: [
          h("strong", { text: "Diagnostic" }),
          h("span", { text: "No controls were detected." })
        ]
      })
    ]
  });
}
