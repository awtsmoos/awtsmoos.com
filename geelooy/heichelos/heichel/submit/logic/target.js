// B"H
/** @module SubmitTarget
 * The palace may reveal the intended home without building it until the traveler
 * actually says Post now.
 */
export function explicitHeichelFromUrl(url = new URL(location.href)) {
  const parts = location.pathname.split("/").filter(Boolean);
  const pathId = parts.length >= 3 && parts.at(-1) === "submit" ? parts.at(-2) : "";
  return url.searchParams.get("heichel") || url.searchParams.get("heichelId") || pathId || "";
}

export async function resolveAlias(input) {
  const local = input?.value?.trim() || window.curAlias || localStorage.getItem("lastAliasUsed") || localStorage.getItem("awtsmoos-alias") || "";
  if (local) return local;
  const data = await fetchJson("/api/social/alias/default");
  const alias = data?.aliasId || data?.id || data?.success?.aliasId || data?.success?.id || (typeof data?.success === "string" ? data.success : "");
  if (alias && input) input.value = alias;
  if (alias) localStorage.setItem("lastAliasUsed", alias);
  return alias || "";
}

export async function resolveTarget(context, options = {}) {
  const aliasId = await resolveAlias(document.getElementById("aliasId"));
  if (!aliasId) throw new Error("Choose or create an alias before posting. Open Profile/Me, set an alias, then return here.");
  const explicit = value("targetHeichelId") || explicitHeichelFromUrl(context.url);
  const seriesId = value("targetSeriesId") || context.parentSeriesId || "root";
  if (value("newHeichelName")) return createOrPreview({ aliasId, explicit, seriesId, options, usedDefault: false });
  if (explicit) return { aliasId, heichelId: explicit, seriesId, usedDefault: false, pendingCreate: false };
  const found = await findDefaultHeichel(aliasId);
  if (found) return { aliasId, heichelId: found, seriesId, usedDefault: true, pendingCreate: false };
  return createOrPreview({ aliasId, explicit: "", seriesId, options, usedDefault: true });
}

export function renderTargetSummary(target) {
  const node = document.getElementById("targetSummary");
  if (!node || !target) return;
  const suffix = target.pendingCreate ? " (will be created when you post)" : "";
  node.textContent = `Posting as ${target.aliasId} into ${target.heichelId}${suffix}${target.seriesId ? ` / ${target.seriesId}` : ""}.`;
}

function value(id) { return document.getElementById(id)?.value?.trim() || ""; }
function safeId(text) { return String(text || "").replace(/[^a-zA-Z0-9_$]/g, "_").slice(0, 26); }
async function fetchJson(url, options) { const r = await fetch(url, options); return r.json().catch(() => null); }

async function findDefaultHeichel(aliasId) {
  const data = await fetchJson(`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos/details`);
  const list = Array.isArray(data) ? data : data?.success || data?.details || [];
  const owned = Array.isArray(list) ? list : [];
  const preferred = owned.find(h => /^(my[_ -]?posts|posts|default)$/i.test(h.id || h.name || h.title || ""));
  return (preferred || owned[0])?.id || "";
}

async function createOrPreview({ aliasId, explicit, seriesId, options, usedDefault }) {
  const name = value("newHeichelName") || "My Posts";
  const heichelId = safeId(explicit || `${aliasId.slice(0, 18)}_posts`);
  if (options.createDefault === false) return { aliasId, heichelId, seriesId, usedDefault, pendingCreate: true };
  return { aliasId, heichelId: await createHeichel(aliasId, heichelId, name), seriesId, usedDefault, pendingCreate: false };
}

async function createHeichel(aliasId, heichelId, name) {
  const body = new URLSearchParams({ aliasId, inputId: heichelId, heichelId, name, heichelName: name, description: "Default posting home", isPublic: "no" });
  const data = await fetchJson(`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos`, { method: "POST", body });
  if (data?.error || data?.code) throw new Error(data?.message || data?.error?.message || "Could not create default heichel.");
  return data?.success?.details?.heichelId || heichelId;
}
