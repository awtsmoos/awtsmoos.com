// B"H
const { encodeSangArtifact } = require('./SangCodec.js');

function addConst(constants, value) { constants.push(value); return constants.length - 1; }
function u16(bytes, value) { bytes.push(value & 255, (value >> 8) & 255); }
function pushConst(bytes, constants, value) { bytes.push(0x13); u16(bytes, addConst(constants, value)); }
function syscall(bytes, id, argc) { bytes.push(0x90, id, argc); }

/**
 * Compiles a tiny data-web graph into SANG bytecode syscalls.
 * HTML/CSS/DOM are not text here; they become a graph of host calls,
 * a small thunder-map where the Awtsmoos lets bytes build visible worlds.
 */
function compileWebGraph(graph = {}) {
  const constants = [], bytecode = [];
  for (const node of graph.nodes || []) {
    pushConst(bytecode, constants, node.tag || 'div');
    pushConst(bytecode, constants, node.id || '');
    pushConst(bytecode, constants, node.text || '');
    pushConst(bytecode, constants, node.style || {});
    syscall(bytecode, 1, 4);
  }
  if (graph.resultExpression) {
    pushConst(bytecode, constants, graph.resultExpression);
    syscall(bytecode, 2, 1);
  }
  bytecode.push(0x01);
  return encodeSangArtifact({
    constants,
    bytecode,
    web: graph,
    meta: { kind: 'web-graph', runtimeTargets: ['browser', 'worker', 'node'] }
  });
}

function createWebHost(documentLike) {
  const journal = [];
  return {
    journal,
    hostAPI: {
      1(tag, id, text, style) {
        const el = documentLike.createElement(tag);
        if (id) el.id = id;
        if (text) el.textContent = text;
        Object.assign(el.style || {}, style || {});
        documentLike.body.appendChild(el);
        journal.push({ op: 'create', tag, id, text, style });
        return el;
      },
      2(expr) { journal.push({ op: 'result', expr }); return journal.length; }
    }
  };
}

module.exports = { compileWebGraph, createWebHost };
