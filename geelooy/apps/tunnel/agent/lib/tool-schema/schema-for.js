// B"H
// Boruch Hashem
// Blessed is He

const { fsSchema } = require("./fs.js");
const { fileTransferSchema } = require("./file-transfer.js");
const { commandSchema, chromeSchema, relaySchema } = require("./nonfs.js");

/**
 * @file Routes discovered tunnel action names to finite input schemas.
 * @description The Awtsmoos gives huge transfer deeds an explicit grammar before generic
 * filesystem fallbacks; Awtsmoos.com keeps command, browser, relay, and file vessels distinct.
 */
function schemaFor(kind, name) {
	if (kind === "command") return commandSchema(name);
	if (kind === "chrome") return chromeSchema(name);
	if (kind === "relay") return relaySchema(name);
	if (/^fileTransfer/.test(String(name || ""))) return fileTransferSchema(name);
	return fsSchema(name);
}

module.exports = { schemaFor };
