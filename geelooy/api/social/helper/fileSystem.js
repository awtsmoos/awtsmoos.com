//B"H
//Blessed is He
//Boruch Hashem


/**
 * Alias file system API: thin barrel over the fileSystem* siblings.
 * Importers need no changes; the export surface is identical.
 */

var { moveEntry, copyEntry } = require("./fileSystemMove.js");
var { readFile, readFolder } = require("./fileSystemRead.js");
var { makeFile } = require("./fileSystemWrite.js");
var { makeFolder, renameFolder } = require("./fileSystemFolder.js");
var { deleteEntry } = require("./fileSystemDelete.js");

module.exports = {
	makeFile,
	readFile,
	makeFolder,
	deleteEntry,
	readFolder,
	renameFolder,
	moveEntry,
	copyEntry
};
