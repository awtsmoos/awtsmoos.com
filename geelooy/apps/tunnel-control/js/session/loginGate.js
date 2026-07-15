// B"H

import { h } from "../ui/core/html.js";

const INSTALL_COMMANDS = Object.freeze([
  {
    id: "unix",
    label: "macOS / Linux",
    prompt: "$",
    command: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"
  },
  {
    id: "windows",
    label: "Windows PowerShell",
    prompt: ">",
    command: "irm https://awtsmoos.com/api/tunnel/install/windows | iex"
  }
]);

/** Creates the authenticated entrance and a copy-safe installer handoff. */
export function createLoginGate() {
  return h("section", {
    classes: ["awt-login-gate"],
    attrs: { "aria-labelledby": "awt-login-title" },
    children: [h("div", { classes: ["awt-login-card"], children: gateChildren() })]
  });
}

function gateChildren() {
  return [
    h("div", { classes: ["awt-gate-brandline"], children: [
      h("span", { classes: ["awt-gate-mark"], attrs: { "aria-hidden": "true" }, text: "א" }),
      h("div", { children: [
        h("div", { classes: ["awt-mini-kicker"], text: "B\"H · TUNNEL CONTROL" }),
        h("span", { classes: ["awt-gate-status"], text: "Encrypted connection handoff" })
      ] })
    ] }),
    h("h1", { attrs: { id: "awt-login-title" }, text: "Open your local codebase through Awtsmoos" }),
    h("p", { classes: ["awt-gate-lede"], text: "Give authorized AI agents a durable route to your own machine while you keep the root, permissions, and off switch." }),
    h("ol", { classes: ["awt-gate-steps"], children: [
      step("01", "Sign in", "Use your Awtsmoos account in this browser."),
      step("02", "Start the tunnel", "Paste one verified command in your terminal."),
      step("03", "Stay in control", "Choose the project root and allowed capabilities.")
    ] }),
    h("div", { classes: ["awt-login-actions"], attrs: { "aria-label": "Tunnel Control actions" }, children: [
      h("a", { attrs: { href: "/login", class: "button-link primary awt-primary-link" }, text: "Continue to secure login" })
    ] }),
    h("aside", { classes: ["awt-install-lines"], attrs: { "aria-label": "Tunnel installer commands" }, children: [
      h("header", { classes: ["awt-install-lines-head"], children: [
        h("div", { children: [h("span", { text: "LOCAL AGENT" }), h("h2", { text: "Install in one command" })] }),
        h("span", { classes: ["awt-transaction-badge"], text: "Verified · transactional" })
      ] }),
      h("p", { text: "The installer checks hashes, probes the complete candidate, preserves your identity, and only then switches versions." }),
      ...INSTALL_COMMANDS.map(commandCard)
    ] })
  ];
}

function step(number, title, copy) {
  return h("li", { children: [
    h("span", { text: number }),
    h("div", { children: [h("strong", { text: title }), h("small", { text: copy })] })
  ] });
}

function commandCard(spec) {
  const code = h("code", { text: spec.command });
  const copy = h("button", {
    attrs: {
      type: "button",
      class: "button-link awt-copy-command",
      "aria-label": `Copy ${spec.label} tunnel installer`
    },
    text: "Copy command"
  });
  copy.addEventListener("click", () => copyCommand(spec, code, copy));
  return h("article", {
    classes: ["awt-install-card"],
    attrs: { "data-platform": spec.id },
    children: [
      h("div", { classes: ["awt-install-card-head"], children: [
        h("h3", { text: spec.label }),
        h("span", { text: spec.id === "unix" ? "Recommended here" : "PowerShell 5+" })
      ] }),
      h("div", { classes: ["awt-command-shell"], children: [h("span", { text: spec.prompt }), code] }),
      copy
    ]
  });
}

async function copyCommand(spec, code, button) {
  const original = "Copy command";
  button.textContent = "Copying…";
  button.disabled = true;
  try {
    await clipboardWriteWithDeadline(spec.command);
    button.textContent = "Copied — paste in Terminal";
    button.dataset.state = "success";
  } catch (_) {
    const copied = selectAndCopy(code);
    button.textContent = copied ? "Copied — paste in Terminal" : "Command selected — press copy";
    button.dataset.state = copied ? "success" : "warning";
  }
  button.disabled = false;
  window.setTimeout(() => {
    button.textContent = original;
    delete button.dataset.state;
  }, 2600);
}

function clipboardWriteWithDeadline(command) {
  if (!navigator.clipboard?.writeText) return Promise.reject(new Error("clipboard_unavailable"));
  return Promise.race([
    navigator.clipboard.writeText(command),
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("clipboard_timeout")), 800))
  ]);
}

function selectAndCopy(code) {
  const selection = window.getSelection?.();
  const range = document.createRange?.();
  if (!selection || !range) return false;
  range.selectNodeContents(code);
  selection.removeAllRanges();
  selection.addRange(range);
  try { return document.execCommand?.("copy") === true; }
  catch (_) { return false; }
}

/** Shows only the login gate. */
export function showLoginGate() {
  document.body.classList.add("awt-gated");
  document.body.classList.remove("awt-preboot");
  document.body.textContent = "";
  document.body.append(createLoginGate());
}
