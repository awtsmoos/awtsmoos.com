// B"H
/**
 * Builds a user-visible note for attached media files.
 * Chapter 12: Each file announces its vessel before the model receives it.
 */
export function describeAttachments(items = []) {
  if (!items.length) return "";
  const lines = items.map((item, index) => `${kind(item.type)} ${index + 1}: ${item.name} (${formatBytes(item.size)})`);
  return `\n\n[Attached media queued]\n${lines.join("\n")}`;
}

function kind(type = "") {
  if (type.startsWith("audio/")) return "Audio";
  if (type.startsWith("video/")) return "Video";
  return "Image";
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
