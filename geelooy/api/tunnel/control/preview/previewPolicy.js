// B"H
const DEFAULT_SETTINGS = Object.freeze({
  allowAiManagePreview: true,
  allowAiCreatePrivate: true,
  allowAiCreatePublic: false,
  allowAiExtendTtl: true,
  allowAiEnableDownload: false,
  allowAiExposeFolders: true,
  allowAiExposeLocalServers: true,
  requireApprovalForPublic: true,
  defaultVisibility: "private",
  defaultTtlSeconds: 3600,
  maxPublicTtlSeconds: 600,
  maxPrivateTtlSeconds: 86400,
  autoPreview: true,
  autoPreviewActions: ["read", "md", "list", "tree", "commandRun", "commandWait", "commandStatus", "commandJobOutputPage", "sharePreviewFile", "sharePreviewFolder", "sharePreviewServer", "previewFile", "previewFolder", "previewPage", "previewExposeLocalServer"],
  secretDenyPatterns: [".env", "*.pem", "*.key", "id_rsa", "id_dsa", ".git/config", "*.p12", "*.pfx"]
});
const VISIBILITIES = new Set(["private", "public", "tunnel-open", "one-time"]);
const KINDS = new Set(["file", "folder", "action", "live", "page", "collection", "proxy"]);
function mergedSettings(settings = {}) { return { ...DEFAULT_SETTINGS, ...(settings || {}), autoPreviewActions: Array.isArray(settings.autoPreviewActions) ? settings.autoPreviewActions : DEFAULT_SETTINGS.autoPreviewActions }; }
function clampTtl(visibility, ttlSeconds, settings = {}) { const s = mergedSettings(settings), fallback = Number(s.defaultTtlSeconds || DEFAULT_SETTINGS.defaultTtlSeconds), wanted = Number(ttlSeconds || fallback), max = visibility === "public" ? Number(s.maxPublicTtlSeconds) : Number(s.maxPrivateTtlSeconds); if (!Number.isFinite(wanted)) return fallback; return Math.max(30, Math.min(Math.floor(wanted), Math.max(30, max))); }
function normalizePreview(input = {}, settings = {}) { const s = mergedSettings(settings), kind = KINDS.has(String(input.kind || "")) ? String(input.kind) : "file", requestedVisibility = String(input.visibility || s.defaultVisibility || "private"), visibility = VISIBILITIES.has(requestedVisibility) ? requestedVisibility : "private"; return { ...input, kind, visibility, ttlSeconds: clampTtl(visibility, input.ttlSeconds, s), allowDownload: !!input.allowDownload, allowFolderBrowse: input.allowFolderBrowse !== false, allowSearch: input.allowSearch !== false, allowRaw: input.allowRaw !== false, access: normalizeAccess(input.access || input.sharedWith || {}) }; }
function normalizeAccess(access = {}) { const userIds = array(access.userIds || access.users || access.sharedUserIds).map(String).filter(Boolean), emails = array(access.emails || access.emailAddresses).map(x => String(x).toLowerCase()).filter(Boolean); return { userIds:[...new Set(userIds)], emails:[...new Set(emails)] }; }
function array(value) { return Array.isArray(value) ? value : value ? [value] : []; }
function deniesSecretPath(path = "", settings = {}) { const normalized = String(path || "").replace(/\\/g, "/").toLowerCase(); return mergedSettings(settings).secretDenyPatterns.some(pattern => globLike(normalized, String(pattern).toLowerCase())); }
function globLike(value, pattern) { const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*"); return new RegExp(`(^|/)${escaped}($|/)`).test(value) || new RegExp(`^${escaped}$`).test(value); }
function aiPolicyCheck(input = {}, settings = {}) { const s = mergedSettings(settings), byAi = input.createdBy === "ai" || input.ai === true; if (!byAi) return { ok:true }; if (!s.allowAiManagePreview) return deny("ai_preview_management_disabled"); const next = normalizePreview(input, s); if (next.visibility === "private" && !s.allowAiCreatePrivate) return deny("ai_private_preview_disabled"); if (["public", "tunnel-open", "one-time"].includes(next.visibility) && !s.allowAiCreatePublic) return deny("ai_public_preview_disabled"); if (next.allowDownload && !s.allowAiEnableDownload) return deny("ai_download_preview_disabled"); if (next.kind === "folder" && !s.allowAiExposeFolders) return deny("ai_folder_preview_disabled"); if (next.kind === "proxy" && !s.allowAiExposeLocalServers) return deny("ai_local_server_preview_disabled"); return { ok:true }; }
function canAutoPreview(action, settings = {}, request = {}) { if (request.autoPreview === false || request.autoPreview === "false") return false; const s = mergedSettings(settings); if (!s.autoPreview) return false; return s.autoPreviewActions.includes(String(action || "")); }
function deny(error) { return { ok:false, error, guidance:"Open Preview Gateway in tunnel-control to change this permission manually." }; }
module.exports = { DEFAULT_SETTINGS, VISIBILITIES, KINDS, aiPolicyCheck, canAutoPreview, clampTtl, deniesSecretPath, mergedSettings, normalizeAccess, normalizePreview };
