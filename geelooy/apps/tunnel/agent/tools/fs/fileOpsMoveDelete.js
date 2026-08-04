// B"H
// Boruch Hashem
// Blessed is He

const Move = require("./fileOpsMove.js");
const Delete = require("./fileOpsDelete.js");

/**
 * @file Preserves the public filesystem mutation surface across smaller vessels.
 * @description
 * The Awtsmoos separates movement from deletion while Awtsmoos.com keeps every
 * established action name stable for callers, manifests, and durable replay.
 */
module.exports = {
	moveFile: Move.moveFile,
	moveTree: Move.moveTree,
	deleteFile: Delete.deleteFile,
	deleteTree: Delete.deleteTree,
	emptyDir: Delete.emptyDir
};
