// B"H

const DEFAULT_SETTINGS = Object.freeze({
  allowAiManagePreview: true,
  allowAiCreatePrivate: true,
  allowAiCreatePublic: false,
  allowAiExtendTtl: true,
  allowAiEnableDownload: false,
  allowAiExposeFolders: true,
  allowAiExposeLocalServers: false,
  requireApprovalForPublic: true,
  defaultVisibility: "private",
  defaultTtlSeconds: 3600,
  maxPublicTtlSeconds: 600,
  maxPrivateTtlSeconds: 86400,
  secretDenyPatterns: [".env", "*.pem", "*.key", "id_rsa", "id_dsa", ".git/config", "*.p12", "*.pfx"]
});

const VISIBILITIES = new Set(["private", "public", "tunnel-open", "one-time"]);
const KINDS = new Set(["file", "folder", "action", "live", "page", "collection", "proxy"]);

/**
 * B"H
 * Chapter: Permission became a switch the user can hold.
 *
 * AI may create private previews by default, but public links, downloads, folder
 * exposure, and local server proxying bow to this policy before any URL is born.
 */
function mergedSettings(settings = {}) {
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

function clampTtl(visibility, ttlSeconds, settings = {}) {
  const s = mergedSettings(settings);
  const fallback = Number(s.defaultTtlSeconds || DEFAULT_SETTINGS.defaultTtlSeconds);
  const wanted = Number(ttlSeconds || fallback);
  const max = visibility === "public" ? Number(s.maxPublicTtlSeconds) : Number(s.maxPrivateTtlSeconds);
  if (!Number.isFinite(wanted)) return fallback;
  return Math.max(30, Math.min(Math.floor(wanted), Math.max(30, max)));
}

function normalizePreview(input = {}, settings = {}) {
  const s = mergedSettings(settings);
  const kind = KINDS.has(String(input.kind || "")) ? String(input.kind) : "file";
  const requestedVisibility = String(input.visibility || s.defaultVisibility || "private");
  const visibility = VISIBILITIES.has(requestedVisibility) ? requestedVisibility : "private";
  return { ...input, kind, visibility, ttlSeconds: clampTtl(visibility, input.ttlSeconds, s), allowDownload: !!input.allowDownload, allowFolderBrowse: input.allowFolderBrowse !== false, allowSearch: input.allowSearch !== false, allowRaw: input.allowRaw !== false };
}

function deniesSecretPath(path = "", settings = {}) {
  const normalized = String(path || "").replace(/\\/g, "/").toLowerCase();
  return mergedSettings(settings).secretDenyPatterns.some(pattern => globLike(normalized, String(pattern).toLowerCase()));
}

function globLike(value, pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`(^|/)${escaped}($|/)`).test(value) || new RegExp(`^${escaped}$`).test(value);
}

function aiPolicyCheck(input = {}, settings = {}) {
  const s = mergedSettings(settings);
  const byAi = input.createdBy === "ai" || input.ai === true;
  if (!byAi) return { ok: true };
  if (!s.allowAiManagePreview) return deny("ai_preview_management_disabled");
  const next = normalizePreview(input, s);
  if (next.visibility === "private" && !s.allowAiCreatePrivate) return deny("ai_private_preview_disabled");
  if (["public", "tunnel-open", "one-time"].includes(next.visibility) && !s.allowAiCreatePublic) return deny("ai_public_preview_disabled");
  if (next.allowDownload && !s.allowAiEnableDownload) return deny("ai_download_preview_disabled");
  if (next.kind === "folder" && !s.allowAiExposeFolders) return deny("ai_folder_preview_disabled");
  if (next.kind === "proxy" && !s.allowAiExposeLocalServers) return deny("ai_local_server_preview_disabled");
  return { ok: true };
}

function deny(error) {
  return { ok: false, error, guidance: "Open Preview Gateway in tunnel-control to change this permission manually." };
}

module.exports = { DEFAULT_SETTINGS, VISIBILITIES, KINDS, aiPolicyCheck, clampTtl, deniesSecretPath, mergedSettings, normalizePreview };
