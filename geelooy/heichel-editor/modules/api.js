// B"H
/**
 * @module EditorApi
 * @description
 * Sends governance requests with the actor attached, returning clean errors
 * instead of hiding server replies inside alert strings.
 */

/**
 * Posts a form body to a social API endpoint.
 * @param {string} url endpoint
 * @param {string} actorAlias acting alias
 * @param {Record<string,string>} body form body
 * @returns {Promise<unknown>}
 */
export async function postEditorRequest(url, actorAlias, body) {
  const response = await fetch(url, {
    method: "POST",
    body: new URLSearchParams({ actorAlias, ...body })
  });
  const json = await response.json().catch(() => null);
  if (!response.ok || json?.error || json?.success === false) {
    throw new Error(json?.error?.message || json?.message || response.statusText);
  }
  return json?.success ?? json;
}
