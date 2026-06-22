/* B"H */
export async function connectorStatus(connector) { return api(`/api/streaming/${connector}`); }
export async function connectorAction(connector, action, payload = {}) { return api(`/api/streaming/${connector}/${action}`, payload); }
async function api(url, body) {
  const hasBody = body && Object.keys(body).length;
  const options = hasBody ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {};
  const res = await fetch(url, options); const data = await res.json(); if (!data.ok) throw new Error(data.error || 'streaming_api_failed'); return data;
}
