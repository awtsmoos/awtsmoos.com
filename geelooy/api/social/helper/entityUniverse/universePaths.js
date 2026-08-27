// B"H
/**
 * @module UniversePaths
 * @description
 * Chapter 162: The recursive entity universe must never collide as file and
 * folder. Every entity is a chamber; `data` is the scroll, and subfolders hold
 * children, edges, snapshots, forks, and DNA.
 */

const { sp } = require('../_awtsmoos.constants.js');

function enc(value) {
  return encodeURIComponent(String(value || 'root'));
}

function root() {
  return `${sp}/entityUniverse`;
}

function typeRoot(type) {
  return `${root()}/types/${enc(type)}`;
}

function folder(entity) {
  return `${typeRoot(entity.type)}/${enc(entity.id)}`;
}

function data(entity) {
  return `${folder(entity)}/data`;
}

function children(entity) {
  return `${folder(entity)}/children`;
}

function child(entity, childId) {
  return `${children(entity)}/${enc(childId)}`;
}

function edges(entity, direction = 'out') {
  return `${folder(entity)}/edges/${direction}`;
}

function edge(entity, direction, edgeId) {
  return `${edges(entity, direction)}/${enc(edgeId)}`;
}

function snapshots(entity) {
  return `${folder(entity)}/snapshots`;
}

function snapshot(entity, snapshotId) {
  return `${snapshots(entity)}/${enc(snapshotId)}`;
}

function forks(entity) {
  return `${folder(entity)}/forks`;
}

function fork(entity, forkId) {
  return `${forks(entity)}/${enc(forkId)}`;
}

function dna(entity) {
  return `${folder(entity)}/dna`;
}

function aliasIndex(aliasId) {
  return `${root()}/byAlias/${enc(aliasId)}`;
}

function heichelIndex(heichelId) {
  return `${root()}/byHeichel/${enc(heichelId)}`;
}

function seriesIndex(heichelId, seriesId) {
  return `${root()}/bySeries/${enc(heichelId)}/${enc(seriesId)}`;
}

function globalIndex(type) {
  return `${root()}/global/${enc(type)}`;
}

module.exports = { root, typeRoot, folder, data, children, child, edges, edge, snapshots, snapshot, forks, fork, dna, aliasIndex, heichelIndex, seriesIndex, globalIndex };
