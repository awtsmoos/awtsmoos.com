// B"H
/**
 * Chapter 522: Paths are the arteries. Name them clearly and the blood of
 * the small social universe knows where to flow.
 */
const { sp } = require('../_awtsmoos.constants.js');

function root() { return `${sp}/thoughts`; }
function byIdPath(id) { return `${root()}/byId/${id}`; }
function byEntityPath(type, id) { return `${root()}/byEntity/${type}/${id}`; }
function byEntityItemPath(type, id, thought) { return `${byEntityPath(type, id)}/${thought}`; }
function byAliasPath(alias) { return `${root()}/byAlias/${alias}`; }
function byAliasItemPath(alias, thought) { return `${byAliasPath(alias)}/${thought}`; }
function byHeichelPath(heichel) { return `${root()}/byHeichel/${heichel}`; }
function byHeichelItemPath(heichel, thought) { return `${byHeichelPath(heichel)}/${thought}`; }
function repliesPath(parent) { return `${root()}/replies/${parent}`; }
function replyItemPath(parent, reply) { return `${repliesPath(parent)}/${reply}`; }
function reactionsPath(thought) { return `${root()}/reactions/${thought}`; }
function reactionAliasPath(thought, alias) { return `${reactionsPath(thought)}/${alias}`; }

module.exports = {
  root, byIdPath, byEntityPath, byEntityItemPath, byAliasPath, byAliasItemPath,
  byHeichelPath, byHeichelItemPath, repliesPath, replyItemPath, reactionsPath, reactionAliasPath
};
