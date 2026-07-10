// B"H
/** Compatibility doorway into the registry-driven imported comment federation. */
const { loadImported } = require('./imported/orchestrator.js');
async function getImportedTree(context) {
  const result = await loadImported(context);
  return result.rows;
}
async function getImportedTreeReport(context) { return await loadImported(context); }
module.exports = { getImportedTree, getImportedTreeReport };
