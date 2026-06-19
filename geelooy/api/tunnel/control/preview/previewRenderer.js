// B"H

function esc(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function html(body, statusCode = 200) {
  return { statusCode, mimeType: "text/html; charset=utf-8", headers: { "Cache-Control": "private, no-store, max-age=0" }, response: body, body };
}

/**
 * B"H
 * Chapter: Every preview became a glowing page instead of a pasted wall.
 */
function renderPreviewShell(preview, inner = "") {
  return html(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(preview.title)}</title>${style()}</head><body><main class="awt-view"><header><p>B\"H · Awtsmoos Preview Gateway</p><h1>${esc(preview.title)}</h1><div class="chips"><span>${esc(preview.kind)}</span><span>${esc(preview.visibility)}</span><span>${esc(preview.targetVessel)}</span></div></header>${inner}<footer><code>${esc(preview.id)}</code><span>Expires ${new Date(preview.expiresAt).toLocaleString()}</span></footer></main></body></html>`);
}

function renderPreview(preview, dynamic = {}) {
  if (preview.kind === "page") return renderPreviewShell(preview, pageBody(preview));
  if (preview.kind === "folder") return renderPreviewShell(preview, folderBody(preview, dynamic));
  if (preview.kind === "proxy") return renderPreviewShell(preview, proxyBody(preview));
  if (preview.kind === "live") return renderPreviewShell(preview, liveBody(preview));
  if (preview.kind === "collection") return renderPreviewShell(preview, collectionBody(preview));
  return renderPreviewShell(preview, fileBody(preview, dynamic));
}

function fileBody(preview, dynamic = {}) {
  const path = preview.source?.path || ".";
  const content = dynamic.ok === false ? `<p class="warn">${esc(dynamic.error || "Unable to read file.")}</p>` : `<pre class="file-body">${esc(dynamic.content || dynamic.body || "")}</pre>`;
  return `<section class="card"><h2>File preview</h2><dl><dt>Path</dt><dd><code>${esc(path)}</code></dd><dt>Raw metadata</dt><dd><a href="/view/${esc(preview.id)}/raw">JSON</a></dd></dl>${content}</section>`;
}
function folderBody(preview, dynamic = {}) {
  const path = preview.source?.path || ".";
  const items = (dynamic.detailedItems || dynamic.items || []).slice(0, 400);
  const list = items.length ? `<div class="folder-list">${items.map(item => {
    const name = typeof item === "string" ? item : item.name + (item.isDirectory ? "/" : "");
    return `<span>${esc(name)}</span>`;
  }).join("")}</div>` : `<p class="warn">${esc(dynamic.error || "No folder entries loaded.")}</p>`;
  return `<section class="card"><h2>Folder browser</h2><p>Folder browsing is allowed: ${preview.allowFolderBrowse ? "yes" : "no"}. Search: ${preview.allowSearch ? "yes" : "no"}.</p><p><code>${esc(path)}</code></p>${list}</section>`;
}
function proxyBody(preview) {
  const source = preview.source || {};
  const target = source.url || (source.port ? `http://127.0.0.1:${source.port}${source.path || "/"}` : "");
  const proxy = `/view/${encodeURIComponent(preview.id)}/proxy`;
  return `<section class="card live"><h2>Local server proxy</h2><p>This preview forwards through the selected tunnel vessel.</p><p><a href="${esc(proxy)}" target="_blank" rel="noopener">Open raw proxy</a></p><p><code>${esc(target)}</code></p><iframe class="proxy-frame" src="${esc(proxy)}" title="${esc(preview.title)}"></iframe></section>`;
}
function liveBody(preview) {
  return `<section class="card live"><h2>Live stream</h2><div id="stream">Waiting for websocket frames...</div><script>try{const ws=new WebSocket(location.href.replace(/^http/,'ws')+'/ws');ws.onmessage=e=>{const d=document.createElement('pre');d.textContent=e.data;document.getElementById('stream').prepend(d)}}catch(e){}</script></section>`;
}
function pageBody(preview) {
  const source = preview.source || {};
  return `<section class="card"><style>${source.css || ""}</style>${source.html || "<p>Empty generated page.</p>"}</section>`;
}
function collectionBody(preview) {
  const items = Array.isArray(preview.source?.items) ? preview.source.items : [];
  return `<section class="card"><h2>Collection</h2>${items.map(item => `<article><b>${esc(item.title || item.kind || "item")}</b><p>${esc(item.path || item.url || item.id || "")}</p></article>`).join("")}</section>`;
}
function style() {
  return `<style>body{margin:0;background:#06101f;color:#eef7ff;font-family:Inter,system-ui,sans-serif}.awt-view{max-width:1400px;margin:auto;padding:28px}header{border:1px solid #2e5777;border-radius:28px;padding:28px;background:radial-gradient(circle at top right,#224d7a,transparent 45%),linear-gradient(135deg,#08182d,#101d38)}h1{font-size:clamp(2rem,7vw,5rem);line-height:.9;margin:.2em 0;letter-spacing:0}.chips{display:flex;gap:8px;flex-wrap:wrap}.chips span{border:1px solid #5acbff55;border-radius:999px;padding:7px 10px;color:#8be7ff}.card{margin-top:18px;border:1px solid #ffffff18;border-radius:12px;padding:22px;background:#ffffff0b;box-shadow:0 20px 70px #0007}.live{border-color:#ffd56f55;background:linear-gradient(135deg,#ffd56f18,#ffffff08)}.proxy-frame{width:100%;min-height:72vh;border:1px solid #8be7ff55;border-radius:10px;background:white;margin-top:16px}.folder-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.folder-list span{border:1px solid #ffffff18;border-radius:8px;padding:8px;background:#ffffff08}.warn{color:#ffd56f}.file-body{max-height:70vh;overflow:auto;background:#030812;border:1px solid #ffffff18;border-radius:8px;padding:14px}code,pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#ffd56f}a{color:#8be7ff}footer{opacity:.7;display:flex;justify-content:space-between;gap:10px;margin-top:18px}</style>`;
}

module.exports = { renderPreview, renderPreviewShell };
