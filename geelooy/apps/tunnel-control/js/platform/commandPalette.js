// B"H

import { h } from "../ui/core/html.js";
import { activatePane } from "../router/paneRouter.js";

const COMMANDS = [
  ["setup", "Open setup"],
  ["apiKeys", "Open API keys"],
  ["explorer", "Open explorer"],
  ["terminal", "Open terminal"],
  ["chrome", "Open chrome"],
  ["docs", "Open docs"],
  ["usage", "Open usage"],
  ["account", "Open account"],
  ["install", "Open install"]
];

export function mountCommandPalette() {
  if (document.getElementById("awtCommandPalette")) return;

  const input = h("input", {
    attrs: { placeholder: "Search commands..." },
    classes: ["awt-command-input"]
  });

  const results = h("div", {
    classes: ["awt-command-results"]
  });

  function render(query = "") {
    results.replaceChildren(...COMMANDS
      .filter(([, label]) => label.toLowerCase().includes(query.toLowerCase()))
      .map(([id, label]) => h("button", {
        classes: ["awt-command-item"],
        text: label,
        onclick: () => {
          activatePane(id);
          root.hidden = true;
        }
      }))
    );
  }

  input.addEventListener("input", () => render(input.value));

  const root = h("div", {
    attrs: { id: "awtCommandPalette" },
    classes: ["awt-command-palette"],
    children: [input, results]
  });

  root.hidden = true;
  document.body.append(root);
  render();

  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      root.hidden = !root.hidden;
      if (!root.hidden) input.focus();
    }
  });
}
