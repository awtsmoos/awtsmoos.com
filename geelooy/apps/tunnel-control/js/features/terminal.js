
// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";

export function terminal() {
  return h("section", { className: "pane", data: { pane: "terminal" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Terminal" }), h("h2", { text: "Command runner" })]),
    h("article", { className: "panel" }, [
      h("div", { className: "form-grid" }, [
        field("commandShell", "Shell", { value: "powershell", className: "span-3" }),
        field("commandCwd", "CWD inside root", { value: ".", className: "span-6" }),
        field("commandTimeout", "Timeout ms", { type: "number", value: "20000", className: "span-3" }),
        area("commandText", "Command", "node -v")
      ]),
      h("button", { id: "runCommandBtn", className: "primary", text: "Run command" })
    ]),
    out("terminalOut")
  ]);
}

export function mountTerminal() {
  $("runCommandBtn").onclick = async () => {
    const got = await callFs({ action: "commandRun", shell: $("commandShell").value, cwd: $("commandCwd").value, command: $("commandText").value, timeoutMs: $("commandTimeout").value });
    show("terminalOut", got);
  };
}
