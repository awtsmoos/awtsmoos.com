/* B"H */
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob); const a = Object.assign(document.createElement('a'), { href:url, download:name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
