
// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";

export function terminal() {
  return h("section", { className: "pane", data: { pane: "terminal" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Terminal" }), h("h2", { text: "Command and Node tests" })]),
    h("article", { className: "panel stack" }, [
      h("p", { text: "Enable Allow commands and Terminal tool in Root permissions, save config, then test here." }),
      h("div", { className: "form-grid" }, [
        field("commandShell", "Shell", { value: "powershell", className: "span-3" }),
        field("commandCwd", "CWD inside root", { value: ".", className: "span-6" }),
        field("commandTimeout", "Timeout ms", { type: "number", value: "20000", className: "span-3" }),
        area("commandText", "Command", "node -v")
      ]),
      h("div", { className: "button-row" }, [h("button", { id: "runCommandBtn", className: "primary", text: "Run command" }), h("button", { id: "testCommandBtn", text: "Quick test" })])
    ]),
    h("article", { className: "panel stack" }, [
      area("nodeScriptText", "Sandboxed node script", "console.log('B\\\"H node script test'); return { cwdList: await list('.') };"),
      h("button", { id: "runNodeScriptBtn", text: "Run nodeScriptRun" })
    ]),
    out("terminalOut")
  ]);
}

export function mountTerminal() {
  $("runCommandBtn").onclick = runCommand;
  $("testCommandBtn").onclick = () => { $("commandText").value = "node -e \"console.log(process.version)\""; runCommand(); };
  $("runNodeScriptBtn").onclick = async () => show("terminalOut", await callFs({
    action: "nodeScriptRun",
    scriptText: $("nodeScriptText").value,
    timeoutMs: $("commandTimeout").value,
    cwd: $("commandCwd").value
  }));
}

async function runCommand() {
  const got = await callFs({
    action: "commandRun",
    shell: $("commandShell").value,
    cwd: $("commandCwd").value,
    command: $("commandText").value,
    timeoutMs: $("commandTimeout").value
  });
  show("terminalOut", got);
}
