// B"H

/**
 * Chapter 2: The Executor Seed Hidden in the Crown.
 *
 * This module receives the self-bundled MerkavaExecutor bytecode and names it
 * as the actual browser intelligence. The native C executable may carry this
 * seed, wake it, and obey it; it may not replace its wisdom with C-side browser
 * guesses.
 *
 * @param {{binary: Uint8Array|Buffer, fileCount?: number, entry?: string}} bundle
 * @returns {{name: string, byteLength: number, fileCount: number, entry: string}}
 */
export function describeEmbeddedExecutor(bundle) {
  const binary = bundle?.binary || [];
  return {
    name: "embedded_executor.merkava",
    byteLength: binary.length || 0,
    fileCount: bundle?.fileCount || 0,
    entry: bundle?.entry || "/index.html"
  };
}

/**
 * @param {object} artifact
 * @returns {string}
 */
export function executorArtifactBanner(artifact) {
  return [
    "B'H embedded MerkavaExecutor bytecode artifact",
    `name=${artifact.name}`,
    `bytes=${artifact.byteLength}`,
    `files=${artifact.fileCount}`,
    `entry=${artifact.entry}`
  ].join("\n");
}
