// B"H

const files = new Map([
  ["/README.awt", "B\"H\nThis is the virtual runtime filesystem. It is safe, in-memory, and ready for simulated workflows."],
  ["/semantic/intent.txt", "Intent routes can land here before becoming real tunnel actions."],
  ["/dreams/next-runtime.md", "# Runtime Dream\nA place where future changes can be modeled before touching local files."]
]);

/**
 * B"H
 * Lists virtual files beneath a path.
 *
 * @param {string} base Virtual base path.
 * @returns {object[]} Entries.
 */
export function listVirtualFiles(base = "/") {
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return [...files.keys()]
    .filter(path => base === "/" || path.startsWith(prefix))
    .map(path => ({ path, type: "file", bytes: files.get(path).length }));
}

/**
 * B"H
 * Reads a virtual file.
 *
 * @param {string} path Virtual path.
 * @returns {object} Result.
 */
export function readVirtualFile(path) {
  if (!files.has(path)) return { ok: false, error: "Virtual file not found.", path };
  return { ok: true, path, content: files.get(path) };
}

/**
 * B"H
 * Writes a virtual file.
 *
 * @param {string} path Virtual path.
 * @param {string} content Content.
 * @returns {object} Result.
 */
export function writeVirtualFile(path, content) {
  files.set(path, String(content ?? ""));
  return { ok: true, path, bytes: files.get(path).length };
}

/**
 * B"H
 * Returns a filesystem snapshot.
 *
 * @returns {object} Snapshot.
 */
export function snapshotVirtualFilesystem() {
  return Object.fromEntries([...files.entries()]);
}
