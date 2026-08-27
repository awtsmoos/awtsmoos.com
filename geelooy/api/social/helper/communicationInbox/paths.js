// B"H
/**
 * Chapter 534: The inbox has roads. Alias roads, thread roads, read-state
 * roads. The same palace can later open inside `/os` and `/apps/code`.
 */
const { sp } = require('../_awtsmoos.constants.js');

function root() { return `${sp}/communicationInbox`; }
function byAlias(alias) { return `${root()}/byAlias/${alias}`; }
function byAliasItem(alias, item) { return `${byAlias(alias)}/${item}`; }
function byThread(alias, thread) { return `${root()}/byThread/${alias}/${thread}`; }
function byThreadItem(alias, thread, item) { return `${byThread(alias, thread)}/${item}`; }
function readState(alias, item) { return `${root()}/readState/${alias}/${item}`; }

module.exports = { root, byAlias, byAliasItem, byThread, byThreadItem, readState };
