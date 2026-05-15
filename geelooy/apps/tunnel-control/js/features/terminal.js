
// B"H
import { h, $, out } from "../ui/dom.js";
import { callFs, show, humanError } from "../ui/api.js";

function field(id, label, attrs = {}, cls = "") {
  return h("label", { className: "term-field " + cls }, [
    h("span", { text: label }),
    h("input", { id, ...attrs })
  ]);
}

function area(id, label, text = "", cls = "") {
  return h("label", { className: "term-field " + cls }, [
    h("span", { text: label }),
    h("textarea", { id, value: text })
  ]);
}

function button(id, text, primary = false) {
  return h("button", { id, text, className: primary ? "primary" : "" });
}

export function terminal() {
  return h("section", { className: "pane", data: { pane: "terminal" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Terminal" }),
      h("h2", { text: "Command and Node tests" }),
      h("p", { text: "Run commands inside the selected root. Results are shown as exit code, timing, stdout, and stderr." })
    ]),

    h("article", { className: "panel terminal-panel stack" }, [
      h("div", { className: "terminal-grid" }, [
        field("commandShell", "Shell", { value: "powershell" }, "span-3"),
        field("commandCwd", "CWD inside root", { value: "." }, "span-5"),
        field("commandTimeout", "Timeout ms", { type: "number", value: "20000" }, "span-2"),
        field("commandMaxChars", "Max output", { type: "number", value: "120000" }, "span-2"),
        area("commandText", "Command", "node -v", "span-12 command-area")
      ]),
      h("div", { className: "button-row" }, [
        button("runCommandBtn", "Run command", true),
        button("testCommandBtn", "Quick node -v"),
        button("testPwdBtn", "Print cwd"),
        button("clearTerminalBtn", "Clear")
      ])
    ]),

    h("div", { id: "terminalResult", className: "result-card hidden" }),

    h("article", { className: "panel terminal-panel stack" }, [
      h("h3", { text: "Sandboxed node script" }),
      h("p", { className: "muted", text: "Runs through nodeScriptRun and returns a structured result." }),
      area("nodeScriptText", "Script", "console.log('B\\\"H node script test'); return { cwdList: await list('.') };", "span-12 script-area"),
      h("div", { className: "button-row" }, [
        button("runNodeScriptBtn", "Run nodeScriptRun", true),
        button("clearNodeScriptBtn", "Clear result")
      ])
    ]),

    h("div", { id: "nodeScriptResult", className: "result-card hidden" }),

    h("details", {}, [
      h("summary", { text: "Raw terminal response" }),
      out("terminalOut", "No command run yet.")
    ])
  ]);
}

export function mountTerminal() {
  $("runCommandBtn").onclick = runCommand;

  $("testCommandBtn").onclick = () => {
    $("commandText").value = "node -v";
    runCommand();
  };

  $("testPwdBtn").onclick = () => {
    $("commandText").value = processShellCwdCommand();
    runCommand();
  };

  $("clearTerminalBtn").onclick = () => {
    $("terminalResult").classList.add("hidden");
    $("terminalOut").textContent = "Cleared.";
  };

  $("runNodeScriptBtn").onclick = runNodeScript;

  $("clearNodeScriptBtn").onclick = () => {
    $("nodeScriptResult").classList.add("hidden");
    $("terminalOut").textContent = "Cleared.";
  };
}

function processShellCwdCommand() {
  const shell = String($("commandShell").value || "").toLowerCase();
  return shell === "cmd" ? "cd" : "pwd";
}

function textOrEmpty(value) {
  return String(value || "");
}

function clip(value, max = 12000) {
  value = textOrEmpty(value);
  return value.length > max ? value.slice(0, max) + "\n\n... clipped in UI ..." : value;
}

function statusClass(got) {
  if (!got || got.ok === false) return "bad";
  if (Number(got.exitCode || 0) !== 0) return "warn";
  return "good";
}

function resultHeader(got, title) {
  const klass = statusClass(got);
  const status = got?.ok === false
    ? "Failed"
    : Number(got?.exitCode || 0) === 0
      ? "Success"
      : "Exited " + got.exitCode;

  return h("div", { className: "result-head" }, [
    h("div", {}, [
      h("p", { className: "eyebrow", text: title }),
      h("h3", { text: status })
    ]),
    h("span", { className: "status-pill " + klass, text: status })
  ]);
}

function kv(label, value) {
  return h("div", { className: "kv" }, [
    h("span", { text: label }),
    h("b", { text: value === undefined || value === null || value === "" ? "—" : String(value) })
  ]);
}

function block(title, text, kind = "") {
  return h("div", { className: "output-block " + kind }, [
    h("div", { className: "output-title", text: title }),
    h("pre", { text: clip(text) || "—" })
  ]);
}

function renderCommandResult(got) {
  const host = $("terminalResult");
  host.className = "result-card " + statusClass(got);
  host.replaceChildren(
    resultHeader(got, "Command result"),
    h("div", { className: "kv-grid" }, [
      kv("Shell", got.shell || $("commandShell").value),
      kv("Shell file", got.shellFile || ""),
      kv("Exit code", got.exitCode ?? "—"),
      kv("Duration", got.durationMs ? got.durationMs + "ms" : "—"),
      kv("CWD", got.cwd || ""),
      kv("Truncated", got.truncated ? "yes" : "no")
    ]),
    h("div", { className: "command-line" }, [
      h("span", { text: "$" }),
      h("code", { text: got.command || $("commandText").value })
    ]),
    block("STDOUT", got.stdout, "stdout"),
    block("STDERR", got.stderr, got.stderr ? "stderr" : ""),
    got.error ? block("Error", got.error, "stderr") : h("span")
  );
  host.classList.remove("hidden");
}

function renderNodeResult(got) {
  const host = $("nodeScriptResult");
  host.className = "result-card " + (got.ok === false ? "bad" : "good");

  const value = got.result?.value ?? got.result ?? got.value ?? got;
  const stdout = got.stdout || got.logs || "";

  host.replaceChildren(
    resultHeader(got, "Node script result"),
    h("div", { className: "kv-grid" }, [
      kv("Action", got.action || "nodeScriptRun"),
      kv("Duration", got.durationMs ? got.durationMs + "ms" : "—"),
      kv("OK", got.ok === false ? "false" : "true")
    ]),
    block("Returned value", typeof value === "string" ? value : JSON.stringify(value, null, 2), "stdout"),
    stdout ? block("Logs", Array.isArray(stdout) ? stdout.join("\n") : stdout, "stdout") : h("span"),
    got.error ? block("Error", humanError(got), "stderr") : h("span")
  );

  host.classList.remove("hidden");
}

async function runCommand() {
  $("terminalResult").classList.remove("hidden");
  $("terminalResult").className = "result-card warn";
  $("terminalResult").replaceChildren(
    h("div", { className: "result-head" }, [
      h("div", {}, [h("p", { className: "eyebrow", text: "Command result" }), h("h3", { text: "Running..." })]),
      h("span", { className: "status-pill warn", text: "Running" })
    ])
  );

  const got = await callFs({
    action: "commandRun",
    shell: $("commandShell").value,
    cwd: $("commandCwd").value,
    command: $("commandText").value,
    timeoutMs: $("commandTimeout").value,
    maxChars: $("commandMaxChars").value
  });

  show("terminalOut", got);
  renderCommandResult(got);
}

async function runNodeScript() {
  $("nodeScriptResult").classList.remove("hidden");
  $("nodeScriptResult").className = "result-card warn";
  $("nodeScriptResult").replaceChildren(
    h("div", { className: "result-head" }, [
      h("div", {}, [h("p", { className: "eyebrow", text: "Node script result" }), h("h3", { text: "Running..." })]),
      h("span", { className: "status-pill warn", text: "Running" })
    ])
  );

  const got = await callFs({
    action: "nodeScriptRun",
    scriptText: $("nodeScriptText").value,
    timeoutMs: $("commandTimeout").value,
    cwd: $("commandCwd").value,
    maxChars: $("commandMaxChars").value
  });

  show("terminalOut", got);
  renderNodeResult(got);
}
