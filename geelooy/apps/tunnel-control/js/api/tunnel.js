// B"H
import { getJson } from "./http.js";
import { b64Json, b64Text } from "../lib/base64.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";
import { log } from "../logger.js";
import { VIRTUAL_OS_TUNNEL } from "../features/vessels/selector.js";
import { attachRequestGuard, validateResponseGuard } from "./requestGuard.js";

const SESSION_OK_ACTIONS = new Set(["configGet", "configSet", "roots", "rootBrowse", "rootSelect", "openRoot", "aiAgentList", "aiAgentSetProviderKey", "aiAgentRemoveProviderKey", "aiAgentMessage", "aiAgentSpawnTask", "aiAgentSpawnNovel", "aiAgentTaskStatus", "aiAgentTaskResult", "aiAgentTaskList", "aiAgentConfigSet", "actionHistoryList", "actionHistoryGet", "actionHistorySearch", "actionHistoryExplain", "actionHistoryDiff", "chromeFind", "chromeLaunch", "chromeStatus", "chromeNavigate", "chromeWaitForSelector", "chromeClick", "chromeType", "chromeEval", "chromeRunScript", "chromeScreenshot", "remoteDesktopPolicy", "remoteDesktopPlatformCapabilities", "remoteDesktopScreenshotSourcePlan", "remoteDesktopChromeFramePlan", "remoteDesktopNativeHelperPlan", "remoteDesktopHelperSkeletons", "remoteDesktopPeerConnectionPlan", "remoteDesktopPeerStateTemplate", "remoteDesktopBrowserPeerScript", "remoteDesktopFeatureCatalog", "remoteDesktopFutureCatalog", "remoteDesktopEngineRoadmap", "remoteDesktopCapabilityMatrix", "remoteDesktopUniversalVision", "remoteDesktopUniversalGraph", "remoteDesktopUniversalRoadmap", "remoteDesktopCreateSession", "remoteDesktopAsk", "remoteDesktopRisk", "remoteDesktopPermissionProfile", "remoteDesktopConsentStatus", "remoteDesktopPermissionContract", "remoteDesktopSessionSummary", "remoteDesktopSignalSummary", "remoteDesktopGrantConsent", "remoteDesktopGrantInput", "remoteDesktopDenyConsent", "remoteDesktopPause", "remoteDesktopResume", "remoteDesktopSessionNote", "remoteDesktopBookmark", "remoteDesktopRevoke", "remoteDesktopSessionList", "remoteDesktopExport", "remoteDesktopOffer", "remoteDesktopAnswer", "remoteDesktopIceCandidate", "remoteDesktopHeartbeat", "remoteDesktopFramePush", "remoteDesktopChromeFramePush", "remoteDesktopChromeScreenshotPush", "remoteDesktopFrameLatest", "remoteDesktopInputEvent", "remoteDesktopAuditLog", "missionStart", "missionProjectDiscover", "missionProjectJoin", "missionProjectStatus", "missionTimeline", "missionRoomUserMessage", "missionAgentHeartbeat", "missionAgentMessage", "missionAgentRespond"]);
const AI_ACTIONS = new Set(["aiAgentList", "aiAgentSetProviderKey", "aiAgentRemoveProviderKey", "aiAgentMessage", "aiAgentSpawnTask", "aiAgentSpawnNovel", "aiAgentTaskStatus", "aiAgentTaskResult", "aiAgentTaskList", "aiAgentConfigSet"]);

/** B"H — Chapter 920: The room endpoints entered by the same guarded gate. */
function setNum(u, name, value) { if (value !== undefined && value !== null && value !== "") u.searchParams.set(name, String(value)); }
function setText(u, name, value) { if (value !== undefined && value !== null && value !== "") u.searchParams.set(name + "64", b64Text(value)); }
function setJson(u, name, value) { if (value !== undefined && value !== null) u.searchParams.set(name + "64", b64Json(value)); }
function publicAiPayload(opts = {}) { const keep = ["provider", "providerId", "agent", "agentId", "model", "taskId", "kind", "title", "outputDir", "fileName", "message", "prompt", "system", "stream", "maxDepth", "maxChildrenPerTask", "maxTotalTasks", "minimumInnovationWindowMs", "minimumProductiveCycles", "minimumProductiveMs", "allowRecursiveSpawn", "pollIntervalMs", "promotionCycles", "agentCycles", "chapterCycles", "providerTimeoutMs", "limit", "apiKey", "saveToAccount", "saveProviderKeyToAccount", "remoteSaveAccount", "storeProviderKeyRemotely", "targetVessel"]; return Object.fromEntries(keep.filter(key => opts[key] !== undefined && opts[key] !== null && opts[key] !== "").map(key => [key, opts[key]])); }
function attachAiPayload(u, opts = {}) { if (!AI_ACTIONS.has(opts.action || "")) return; const payload = publicAiPayload(opts); if (Object.keys(payload).length) setText(u, "text", JSON.stringify(payload)); }
export function resolveTargetTunnelName(tunnelName = "", opts = {}) {
  const explicitTunnel = String(opts.tunnelName || tunnelName || "").trim();
  const explicitVessel = String(opts.targetVessel || opts.vessel || "").trim();
  const tunnelKey = explicitTunnel.toLowerCase();
  const vesselKey = explicitVessel.toLowerCase();
  const virtualAliases = new Set(["virtual", "virtual-os", "awtsmoos-os", VIRTUAL_OS_TUNNEL]);
  const vesselTypeAliases = new Set(["native", "native-local", "native-tunnel", "local", "local-tunnel", "browser", "browser-tab", "tab", "code-tab", "apps-code"]);
  if (virtualAliases.has(tunnelKey) || virtualAliases.has(vesselKey)) return VIRTUAL_OS_TUNNEL;
  if (explicitTunnel && tunnelKey !== "auto") return explicitTunnel;
  if (explicitVessel && !vesselTypeAliases.has(vesselKey)) return explicitVessel;
  return "auto";
}
export function buildFsUrl(tunnelName, rawOpts = {}) {
  const opts = attachRequestGuard(rawOpts);
  const targetName = resolveTargetTunnelName(tunnelName, opts);
  const queryTarget = String(opts.targetVessel || opts.vessel || targetName || "").trim();
  const u = new URL("/api/tunnel/control/fs/" + encodeURIComponent(targetName), location.origin);
  u.searchParams.set("action", opts.action || "list");
  u.searchParams.set("p", opts.path || opts.p || ".");
  u.searchParams.set("clientRequestId", opts.clientRequestId);
  if (queryTarget) u.searchParams.set("targetVessel", queryTarget);
  if (opts.absolutePath) u.searchParams.set("absolutePath", opts.absolutePath);
  for (const key of ["depth", "limit", "maxChars", "totalMaxChars", "maxFiles", "offsetChars", "maxBytes", "offsetBytes", "timeoutMs", "port", "maxDepth", "maxChildrenPerTask", "maxTotalTasks", "minimumInnovationWindowMs", "minimumProductiveCycles", "minimumProductiveMs"]) setNum(u, key, opts[key]);
  setText(u, "content", opts.content); setJson(u, "paths", opts.paths); setJson(u, "files", opts.files); setJson(u, "writes", opts.writes);
  setText(u, "find", opts.find); setText(u, "replace", opts.replace); setText(u, "command", opts.command);
  if (!AI_ACTIONS.has(opts.action || "")) { setText(u, "text", opts.text); setText(u, "apiKey", opts.apiKey); setText(u, "message", opts.message); setText(u, "prompt", opts.prompt); setText(u, "system", opts.system); }
  setText(u, "expression", opts.expression); setText(u, "sdp", opts.sdp); setText(u, "candidate", opts.candidate); setText(u, "frame", opts.frame); setText(u, "frame64", opts.frame64); attachAiPayload(u, { ...opts, targetVessel: queryTarget });
  for (const key of ["regex", "replaceAll", "allowWrite", "allowSecrets", "enableLocalHttpProxy", "allowCommands", "stream"]) if (typeof opts[key] === "boolean") u.searchParams.set(key, String(opts[key]));
  for (const key of ["root", "local", "relay", "setTunnelName", "shell", "cwd", "url", "selector", "chromePath", "userDataDir", "id", "sessionId", "mode", "grantMode", "family", "inputFamily", "source", "snapshot", "target", "requester", "requesterContact", "contact", "purpose", "scope", "ttl", "ttlSeconds", "type", "inputType", "x", "y", "key", "reason", "label", "title", "contentType", "bytes", "format", "quality", "fingerprint", "query", "conversationId", "conversationName", "jobId", "stream", "missionId", "agentId", "role", "capabilities", "projectRoot", "status", "currentAction", "note", "goal"]) if (opts[key]) u.searchParams.set(key, opts[key]);
  setJson(u, "tools", opts.tools); setJson(u, "chrome", opts.chrome); setJson(u, "commandConfig", opts.commandConfig); setJson(u, "aiAgents", opts.aiAgents); setJson(u, "messages", opts.messages); if (typeof opts.script === "string") setText(u, "script", opts.script); else setJson(u, "script", opts.script); setJson(u, "input", opts.input);
  return u.toString();
}
export async function callFs(tunnelNameOrOpts, maybeOpts) {
  const raw = maybeOpts || tunnelNameOrOpts || {};
  const opts = attachRequestGuard(raw);
  const tunnelName = maybeOpts ? tunnelNameOrOpts : opts.tunnelName;
  const action = opts.action || "list";
  const targetName = resolveTargetTunnelName(tunnelName, opts);
  const url = buildFsUrl(targetName, opts);
  const apiKey = await getActiveApiKey();
  log("callFs", { action, tunnelName: targetName, clientRequestId: opts.clientRequestId, url, hasApiKey: !!apiKey });
  if (!apiKey && !SESSION_OK_ACTIONS.has(action)) return { BH: "B\"H", ok: false, error: "missing_active_api_key", message: "Create, paste, or select an API key first.", needed: action.startsWith("command") ? "tunnel.command" : "tunnel.read/tunnel.write" };
  const headers = apiKey ? await authHeaders() : {};
  return validateResponseGuard(await getJson(url, { headers, credentials: "include" }), opts);
}
export async function buildCurl(tunnelName, opts = {}) { const apiKey = await getActiveApiKey(); const targetName = resolveTargetTunnelName(tunnelName, opts); const url = buildFsUrl(targetName, opts); return ["curl \\", " -H \"x-awtsmoos-api-key: " + (apiKey || "PASTE_API_KEY_HERE") + "\" \\", " \"" + url + "\""].join("\n"); }
