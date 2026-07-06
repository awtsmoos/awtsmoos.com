// B"H
/**
 * @module ProfileApi
 * @description
 * Chapter 465 repaired: API calls are no longer endless rooms. The Awtsmoos
 * gives each request a clock, honest `response.json().catch` parsing, and
 * shape normalization so the profile dashboard fails visibly instead of
 * spinning forever.
 */

const DEFAULT_TIMEOUT_MS = 12000;

function withTimeout(options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);
  return { controller, timeout, options: { ...options, signal: controller.signal } };
}

function messageFrom(data, response) {
  return data?.error?.message || data?.error || data?.message || response?.statusText || "Profile API request failed.";
}

function listFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.success)) return data.success;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeAlias(alias) {
  const id = alias?.id || alias?.aliasId || alias?.inputId || alias?.name || "";
  return { ...alias, id: String(id) };
}

export async function apiJson(url, options = {}) {
  const { timeoutMs, ...fetchOptions } = options;
  const timed = withTimeout({ ...fetchOptions, timeoutMs });
  try {
    const response = await fetch(url, timed.options);
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.error) throw new Error(messageFrom(data, response));
    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error(`Profile API timed out: ${url}`);
    throw error;
  } finally {
    clearTimeout(timed.timeout);
  }
}

export async function getDefaultAlias() {
  const result = await apiJson("/api/social/alias/default");
  return result?.success || result?.data || "";
}

export async function getAliasDetails() {
  return listFrom(await apiJson("/api/social/aliases/details")).map(normalizeAlias).filter(alias => alias.id);
}

export async function getHeichelosForAlias(aliasId) {
  const encoded = encodeURIComponent(aliasId);
  return listFrom(await apiJson(`/api/social/alias/${encoded}/heichelos/details`, { timeoutMs: 9000 }));
}

export async function setDefaultAlias(aliasId) {
  const body = `alias=${encodeURIComponent(aliasId)}`;
  const result = await apiJson("/api/social/alias/default", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!result?.success) throw new Error("Default alias was not saved.");
  return aliasId;
}
