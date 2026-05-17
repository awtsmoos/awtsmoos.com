// B"H
const { mkdirp, ensureFile, touch } = require("../fileOpsPaths.js");
const { copyFileNative, copyTree } = require("../fileOpsCopy.js");
const { moveFile, moveTree, deleteFile, deleteTree, emptyDir } = require("../fileOpsMoveDelete.js");

function buildFileOpsActions(ctx) {
  const { config, payload } = ctx;

  return {
    async mkdirp() { return await mkdirp(config, payload); },
    async ensureFile() { return await ensureFile(config, payload); },
    async touch() { return await touch(config, payload); },
    async copyFile() { return await copyFileNative(config, payload); },
    async copyTree() { return await copyTree(config, payload); },
    async moveFile() { return await moveFile(config, payload); },
    async moveTree() { return await moveTree(config, payload); },
    async deleteFile() { return await deleteFile(config, payload); },
    async deleteTree() { return await deleteTree(config, payload); },
    async emptyDir() { return await emptyDir(config, payload); }
  };
}

module.exports = { buildFileOpsActions };
