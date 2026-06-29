// B"H
export function objectUrl(obj) { return `awtsmoos://${obj.type}/${encodeURIComponent(obj.id)}`; }
export function parseObjectUrl(url = "") { const m = String(url).match(/^awtsmoos:\/\/([^/]+)\/(.+)$/); return m ? { type:m[1], id:decodeURIComponent(m[2]) } : null; }
