//B"H
/** Builds a tiny user-visible note for attached image files. */
export function describeAttachments(items = []) {
  if (!items.length) return "";
  const lines = items.map((item, index) => `Image ${index + 1}: ${item.name} (${formatBytes(item.size)})`);
  return `\n\n[Attached images queued]\n${lines.join("\n")}`;
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
