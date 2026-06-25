// B"H
/** Chapter 615: Universal objects open as OS windows. */
import { CivilizationOSClient } from './client.js';
function box(data, title) {
  const node = document.createElement('div');
  node.style.cssText = 'padding:12px;color:#e8f7ff;background:#020611;min-height:100%;font-family:monospace;overflow:auto;';
  node.innerHTML = `<h3>B"H ${title}</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
  return node;
}
export async function openObjectWindow({ os, type, id }) {
  let data;
  if (type && id) data = await CivilizationOSClient.inspectObject(type, id).catch(error => ({ error: String(error) }));
  else {
    const search = await CivilizationOSClient.searchObjects('', 10).catch(() => ({ success: [] }));
    data = { success: { objects: search.success || [] } };
  }
  const title = type && id ? `Object ${type}:${id}` : 'Universal Objects';
  return os?.addWindow?.({ title, content: box(data.success || data.error || data, title), os });
}
