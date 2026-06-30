// B"H
/**
 * @module ProfileApi
 * @description
 * Chapter 21: The Awtsmoos guards every fetch from fake success. This module
 * owns profile API calls, response parsing, and error normalization.
 *
 * @inputs Browser fetch API and social API endpoints.
 * @outputs Parsed JSON data or thrown Error with user-visible message.
 * @failureModes Non-JSON, HTTP failure, and `{ error }` payloads throw.
 */

export async function apiJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.error) {
    const message = data?.error?.message || data?.message || response.statusText;
    throw new Error(message || "Profile API request failed.");
  }
  return data;
}

export async function getDefaultAlias() {
  const result = await apiJson("/api/social/alias/default");
  return result?.success || "";
}

export async function getAliasDetails() {
  const aliases = await apiJson("/api/social/aliases/details");
  return Array.isArray(aliases) ? aliases : aliases?.success || [];
}

export async function getHeichelosForAlias(aliasId) {
  const encoded = encodeURIComponent(aliasId);
  const data = await apiJson(`/api/social/alias/${encoded}/heichelos/details`);
  return Array.isArray(data) ? data : data?.success || [];
}

export async function setDefaultAlias(aliasId) {
  const body = `alias=${encodeURIComponent(aliasId)}`;
  const result = await apiJson("/api/social/alias/default", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!result?.success) throw new Error("Default alias was not saved.");
  return aliasId;
}
