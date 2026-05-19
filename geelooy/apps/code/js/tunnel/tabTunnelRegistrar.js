// B"H

function tabId() {
  const key = "awtsmoos.code.tabTunnelId";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = "code-tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(key, id);
  }
  return id;
}

/**
 * B"H
 * Chapter 1: Every editor tab opened its eye and became a small tunnel-flame.
 * This does not grant filesystem power by itself; it announces a workspace
 * vessel that a higher tunnel-control mesh can bind to real permissions.
 *
 * @param {object} context Optional workspace context.
 * @returns {{id:string,kind:string,startedAt:number}} Registration record.
 */
export function registerCodeTabTunnel(context = {}) {
  const record = {
    id: tabId(),
    kind: "code-tab",
    app: "geelooy/apps/code",
    url: location.href,
    title: document.title || "Awtsmoos Code",
    workspace: context.workspace || localStorage.getItem("awtsmoos.activeWorkspace") || "",
    startedAt: Date.now(),
    capabilities: ["workspace.read", "workspace.write", "plainText.write", "tab.focus"]
  };

  localStorage.setItem("awtsmoos.code.lastTabTunnel", JSON.stringify(record));
  window.dispatchEvent(new CustomEvent("awtsmoos:code-tab-tunnel", { detail: record }));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("awtsmoos:code-tabs");
    channel.postMessage({ type: "code-tab-online", record });
    window.addEventListener("beforeunload", () => channel.postMessage({ type: "code-tab-offline", record }));
  }

  return record;
}
