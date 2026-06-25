// B"H
import { h } from "../ui/core/html.js";
import { callFs } from "../api/tunnel.js";
import { resultCard } from "../ui/api.js";
let currentSessionId = "";
/** B"H — Chapter 913: The remote eye received a visible consent table. */
export function createRemoteDesktopPanel() {
  const out = h("div", { attrs:{ id:"remoteDesktopOut" }, classes:["awt-remote-output"] });
  const session = input("remoteDesktopSessionId", "Session id", "Created session appears here");
  const target = input("remoteDesktopTarget", "Target", "Chrome tab / local desktop");
  const requester = input("remoteDesktopRequester", "Requester", "Awtsmoos operator");
  const mode = select("remoteDesktopMode", "Requested mode", [["watch","Watch only"],["control","Watch + control"]]);
  const grant = select("remoteDesktopGrantMode", "Grant mode", [["watch","Grant watch"],["control","Grant control"]]);
  const click = button("Create request", () => run(out, { action:"remoteDesktopCreateSession", mode:val(mode), target:val(target), requester:val(requester) }, data => setSession(session, data?.session?.id)));
  const policy = button("Policy", () => run(out, { action:"remoteDesktopPolicy" }));
  const grantBtn = button("Grant consent", () => run(out, { action:"remoteDesktopGrantConsent", sessionId:val(session), grantMode:val(grant) }));
  const revoke = button("Revoke", () => run(out, { action:"remoteDesktopRevoke", sessionId:val(session), reason:"UI revoke" }));
  const offer = button("Mock offer", () => run(out, { action:"remoteDesktopOffer", sessionId:val(session), sdp:"ui-redacted-offer" }));
  const inputBtn = button("Test click event", () => run(out, { action:"remoteDesktopInputEvent", sessionId:val(session), type:"click", x:42, y:24 }));
  const audit = button("Audit", () => run(out, { action:"remoteDesktopAuditLog", sessionId:val(session) }));
  return h("section", { classes:["awt-remote-desktop-panel"], children:[
    h("div", { classes:["awt-zone-head"], children:[h("h3", { text:"Remote Desktop Tunnel" }), h("p", { text:"Consent-first watch/control session orchestration. No silent capture. No input until local control grant." })] }),
    h("div", { classes:["awt-remote-grid"], children:[target, requester, mode, grant, session] }),
    h("div", { classes:["awt-quick-actions"], children:[policy, click, grantBtn, offer, inputBtn, audit, revoke] }),
    out
  ] });
}
function input(id, label, placeholder) { return h("label", { classes:["field"], children:[h("span", { text:label }), h("input", { attrs:{ id, placeholder } })] }); }
function select(id, label, pairs) { return h("label", { classes:["field"], children:[h("span", { text:label }), h("select", { attrs:{ id }, children:pairs.map(([value,text]) => h("option", { attrs:{ value }, text })) })] }); }
function button(text, onClick) { const b = h("button", { attrs:{ type:"button" }, text }); b.addEventListener("click", onClick); return b; }
function val(node) { return node.querySelector("input,select")?.value || node.value || ""; }
function setSession(field, id) { currentSessionId = id || currentSessionId; const input = field.querySelector("input"); if (input && currentSessionId) input.value = currentSessionId; }
async function run(out, payload, after) { out.replaceChildren(resultCard({ ok:true, uiMessage:"Running " + payload.action + "..." })); const data = await callFs(window.awtsGetTunnelName?.() || "auto", payload); after?.(data); out.replaceChildren(resultCard(data)); }
