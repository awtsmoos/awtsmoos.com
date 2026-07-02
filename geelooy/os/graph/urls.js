// B"H
export const AWTSMOOS_PROTOCOL = "awtsmoos://";

export function objectUrl(obj = {}) {
  if (obj.url) return obj.url;
  return makeAwtsmoosUrl(obj.provider || obj.type || "object", obj.id || obj.path || "root");
}

export function makeAwtsmoosUrl(provider = "object", path = "") {
  const clean = String(path || "root").replace(/^awtsmoos:\/\//, "").replace(/^\/+/, "");
  return `${AWTSMOOS_PROTOCOL}${provider}/${clean}`.replace(/\s+/g, "%20");
}

export function parseObjectUrl(url = "") {
  const text = String(url || "");
  const m = text.match(/^awtsmoos:\/\/([^/]+)\/?(.*)$/);
  return m ? { provider:m[1], type:m[1], id:decodeURIComponent(m[2] || "root"), path:`/${decodeURIComponent(m[2] || "")}` } : null;
}

export function nodeUrl(node = {}) { return objectUrl(node); }

/** B"H: every node receives a doorway, and every doorway remembers the node. */
