// B"H
/**
 * @module NodeOsPaths
 * @description
 * Chapter 192: The social universe becomes a filesystem. Mount records live in
 * `__mount` so a mounted path can also have child folders without DosDB turning
 * one scroll into another chamber.
 */

const { sp } = require('../_awtsmoos.constants.js');

function enc(value) { return encodeURIComponent(String(value || 'root')); }
function root() { return `${sp}/nodeOs`; }
function pathFolder(path = '/') { return `${root()}/mounts/${path.split('/').filter(Boolean).map(enc).join('/') || 'root'}`; }
function mountPath(path = '/') { return `${pathFolder(path)}/__mount`; }
function nodePath(nodeId) { return `${root()}/nodes/${enc(nodeId)}`; }
function nodeData(nodeId) { return `${nodePath(nodeId)}/data`; }
function nodeChildren(nodeId) { return `${nodePath(nodeId)}/children`; }
function nodeChild(nodeId, childId) { return `${nodeChildren(nodeId)}/${enc(childId)}`; }
function nodeHistory(nodeId) { return `${nodePath(nodeId)}/history`; }
function nodeRefs(nodeId, direction = 'out') { return `${nodePath(nodeId)}/refs/${direction}`; }
function aliasRoot(aliasId) { return `/Aliases/${aliasId}`; }
function heichelRoot(heichelId) { return `/Heichelos/${heichelId}`; }
function entityMount(entity) { return `${heichelRoot(entity.heichelId || 'global')}/Series/${entity.seriesId || 'root'}/Entities/${entity.type}/${entity.id}`; }
function assetMount(manifest) { return `${aliasRoot(manifest.aliasId)}/Assets/${manifest.type || 'asset'}/${manifest.id}`; }

module.exports = { root, pathFolder, mountPath, nodePath, nodeData, nodeChildren, nodeChild, nodeHistory, nodeRefs, aliasRoot, heichelRoot, entityMount, assetMount };
