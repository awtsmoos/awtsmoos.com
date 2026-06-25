// B"H

/**
 * B"H
 * Chapter 1012: The inspector learned to open the ledger scroll.
 * Every action can now reveal summary, arguments, output references, replay
 * payloads, and generated clients from the real input that birthed it.
 */
export function selectedEvent(state) {
  return (state.events || []).find(e => e.id === state.selectedEventId) || [...(state.events || [])].reverse()[0] || null;
}

export function eventApiPayload(event = {}) {
  const p = event.payload || {}, input = p.input || {};
  const action = input.action || p.action || event.type || "unknown";
  return clean({ ...input, action, missionId: event.roomId || input.missionId || p.missionId, agentId: input.agentId || event.actor, targetVessel: input.targetVessel || event.target, path: input.path || input.p || p.path || p.file, command: input.command, url: input.url, selector: input.selector, text: input.text || input.body || input.message });
}

export function replayPayload(event = {}) {
  const id = event.payload?.actionId || event.id;
  return clean({ action: "actionHistoryReplay", actionId: id, parentActionId: id });
}

export function apiSnippets(event = {}) {
  const payload = eventApiPayload(event), replay = replayPayload(event);
  return {
    actionJson: JSON.stringify(payload, null, 2),
    replayJson: JSON.stringify(replay, null, 2),
    curl: curlSnippet(payload),
    fetch: `await fetch("/api/tunnel/control/fs/TUNNEL_NAME", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(${JSON.stringify(payload)}) }).then(r => r.json())`,
    python: `import requests\nprint(requests.post("${locationOrigin()}/api/tunnel/control/fs/TUNNEL_NAME", json=${JSON.stringify(payload)}).json())`
  };
}

export function inspectorSections(event) {
  if (!event) return [{ title: "No event selected", body: "Open a room and select an activity event." }];
  const payload = event.payload || {}, input = payload.input || {}, snippets = apiSnippets(event);
  return [
    summary(event), argumentsSection(input), command(input, payload), output(payload), diff(input, payload), browser(input, payload),
    { title: "Action JSON", body: snippets.actionJson }, { title: "Replay payload", body: snippets.replayJson },
    { title: "cURL", body: snippets.curl }, { title: "JS fetch", body: snippets.fetch },
    { title: "Python requests", body: snippets.python }, raw(event)
  ].filter(Boolean);
}

function summary(event) {
  const p = event.payload || {};
  return { title: "Summary", body: JSON.stringify({ id: event.id, actionId: p.actionId, group: p.group, roomId: event.roomId, at: event.at, actor: event.actor, target: event.target, type: event.type, title: event.title, status: event.status, outputRef: p.outputRef }, null, 2) };
}
function argumentsSection(input = {}) { return Object.keys(input).length ? { title: "Arguments", body: JSON.stringify(input, null, 2) } : null; }
function command(input, p) { if (!input.command && !p.stdout && !p.stderr && p.exitCode === undefined) return null; return { title: "Command", body: [`$ ${input.command || p.command || ""}`, input.cwd ? `cwd: ${input.cwd}` : "", p.exitCode !== undefined ? `exit: ${p.exitCode}` : "", p.durationMs ? `duration: ${p.durationMs}ms` : "", p.stdout ? `\nstdout\n${p.stdout}` : "", p.stderr ? `\nstderr\n${p.stderr}` : ""].filter(Boolean).join("\n") }; }
function output(p = {}) { return p.outputRef || p.inputRef ? { title: "Ledger refs", body: JSON.stringify(clean({ inputRef: p.inputRef, outputRef: p.outputRef, parentActionId: p.parentActionId, replayable: p.replayable }), null, 2) } : null; }
function diff(input, p) { const body = p.diff || p.unifiedDiff || input.patch || (input.before || input.after ? `before\n${input.before || ""}\n\nafter\n${input.after || ""}` : ""); return body ? { title: "Diff / Write", body } : null; }
function browser(input, p) { if (!input.url && !p.screenshot && !input.selector && !p.console && !p.network) return null; return { title: "Browser", body: JSON.stringify(clean({ url: input.url, selector: input.selector, screenshot: p.screenshot || p.screenshotPath, console: p.console, network: p.network }), null, 2) }; }
function raw(event) { return { title: "Raw event", body: JSON.stringify(event, null, 2) }; }
function curlSnippet(payload) { return `curl -X POST -H "content-type: application/json" -d '${JSON.stringify(payload).replace(/'/g, "'\\''")}' "${locationOrigin()}/api/tunnel/control/fs/TUNNEL_NAME"`; }
function locationOrigin() { try { return location.origin; } catch { return "https://awtsmoos.com"; } }
function clean(obj) { return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")); }
