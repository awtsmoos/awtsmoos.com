// B"H
const { createPreview, settingsGet } = require("./previewStore.js");
const { canAutoPreview } = require("./previewPolicy.js");

const POLL_ACTIONS = new Set(["commandStatus", "commandJobOutputPage", "commandWait"]);
function isPreviewAction(action) { return /^preview(File|Folder|Page|Collection|ActionResult|LiveCommand|ExposeLocalServer|Create)$/i.test(String(action || "")); }
function autoCreatePreviewResult(ident, payload, result) {
  if (!ident?.userId || !result || result.ok === false || pollingShouldStayTiny(payload)) return result;
  const preview = explicitPreview(payload, result) || inferredPreview(payload, result, settingsGet(ident.userId));
  if (!preview) return result;
  const created = createPreview(ident.userId, { ...preview, createdBy:preview.createdBy || "ai", ai:true });
  if (created.ok === false) return { ...result, previewCreateError:created, previewInstruction:"Preview was requested but policy blocked creation." };
  return decorate(result, created, explicitPreview(payload, result) ? result.url : "");
}
function pollingShouldStayTiny(payload = {}) { return POLL_ACTIONS.has(String(payload.action || "")) && payload.autoPreview !== true; }
function explicitPreview(payload, result) { return result.preview && (isPreviewAction(payload.action) || result.action?.startsWith?.("sharePreview")) ? result.preview : null; }
function inferredPreview(payload, result, settings) {
  if (!canAutoPreview(payload.action, settings, payload)) return null;
  const common = { title:titleFor(payload, result), tunnelName:payload.tunnelName || payload.targetVessel || "auto", targetVessel:payload.targetVessel || "native-local", visibility:payload.previewVisibility || payload.visibility || "private", ttlSeconds:payload.previewTtlSeconds || payload.ttlSeconds || 3600, conversationId:payload.conversationId || "", conversationName:payload.conversationName || "", access:payload.access || payload.sharedWith || {} };
  if (["read", "md"].includes(payload.action) && safePath(payload.path || payload.p)) return { ...common, kind:"file", path:payload.path || payload.p || "." };
  if (["list", "tree"].includes(payload.action) && safePath(payload.path || payload.p)) return { ...common, kind:"folder", path:payload.path || payload.p || "." };
  if (["commandRun"].includes(payload.action)) return { ...common, kind:"action", actionId:result.jobId || payload.jobId || result.actionId || result.action || payload.action, result:summaryResult(result) };
  if (result.hostedPreview?.preview) return { ...common, ...result.hostedPreview.preview };
  return null;
}
function safePath(path = "") { const p = String(path || ".").toLowerCase(); return !/(^|\/)(\.env|id_rsa|id_dsa|\.git\/config)($|\/)/.test(p) && !/\.(pem|key|p12|pfx)$/i.test(p); }
function titleFor(payload, result) { if (payload.previewTitle || payload.title) return payload.previewTitle || payload.title; if (payload.action === "read" || payload.action === "md") return `File: ${payload.path || payload.p || "."}`; if (payload.action === "list" || payload.action === "tree") return `Folder: ${payload.path || payload.p || "."}`; if (String(payload.action || "").startsWith("command")) return `Command receipt: ${result.jobId || payload.jobId || "latest"}`; return `Awtsmoos preview: ${payload.action}`; }
function summaryResult(result = {}) { return { action:result.action || "", jobId:result.jobId || "", status:result.status || result.exitCode || "", stdout:(result.stdout?.content || result.stdout || "").toString().slice(0, 4000), stderr:(result.stderr?.content || result.stderr || "").toString().slice(0, 2000) }; }
function decorate(result, created, createUrl = "") { const link = { id:created.id, title:created.title, kind:created.kind, visibility:created.visibility, viewUrl:created.viewUrl, rawUrl:created.rawUrl, accessSummary:created.accessSummary, expiresAt:created.expiresAt }; return { ...result, createdPreview:created, previewId:created.id, viewUrl:created.viewUrl, rawUrl:created.rawUrl, wsUrl:created.wsUrl, url:created.viewUrl, createUrl:createUrl || result.url || "", previewLinks:[link, ...(Array.isArray(result.previewLinks) ? result.previewLinks : [])], previewInstruction:`Open ${created.viewUrl}. ${created.accessSummary || "Private preview."}` }; }
module.exports = { autoCreatePreviewResult, isPreviewAction, pollingShouldStayTiny };
