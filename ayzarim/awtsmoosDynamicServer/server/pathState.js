
// B"H

/**
 * B"H
 * Builds initial path state for a request.
 *
 * @param {object} deps Dependency bag.
 * @param {string} directory Server directory.
 * @param {string} mainDir Public main dir.
 * @param {string} originalPath Decoded original path.
 * @returns {object} Path state.
 */
function createPathState(deps, directory, mainDir, originalPath) {
  const serverPath = deps.path.join(directory, mainDir);
  const filePath = deps.path.join(serverPath, originalPath);
  const extname = String(deps.path.extname(filePath)).toLowerCase();

  return {
    serverPath,
    filePath,
    currentPath: filePath,
    parentPath: serverPath,
    extname,
    contentType: deps.mimeTypes[extname] || "application/octet-stream",
    foundAwtsmooses: []
  };
}

module.exports = { createPathState };
