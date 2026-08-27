/* B"H
Download shelf: every recording leaves a visible doorway.
The auto-click still fires, but the file link remains if Chrome blocks repeated downloads.
*/
const downloads = [];

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  downloads.push({ url, name, bytes:blob.size, at:Date.now() });
  const link = createDownloadLink(url, name, blob.size);
  const shelf = document.getElementById('downloadList');
  if (shelf) shelf.prepend(link);
  requestAnimationFrame(() => link.click());
  return { url, name, bytes:blob.size };
}

function createDownloadLink(url, name, bytes) {
  const a = Object.assign(document.createElement('a'), { href:url, download:name, textContent:`${name} · ${formatBytes(bytes)}` });
  a.className = 'download-link';
  a.dataset.downloadUrl = url;
  return a;
}

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

window.addEventListener?.('beforeunload', () => downloads.forEach(item => URL.revokeObjectURL(item.url)));
