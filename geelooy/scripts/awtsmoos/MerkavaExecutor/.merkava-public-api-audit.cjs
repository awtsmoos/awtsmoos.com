#!/usr/bin/env node
// B"H
/**
 * Public-surface audit for MerkavaExecutor.
 * Fails if helper modules expose methods that the top-level API forgets.
 */
const fs = require('fs');
const path = require('path');
const root = __dirname;

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function requireKeys(file) {
  return Object.keys(require(path.join(root, file))).sort();
}

function loadBinaryModuleKeys() {
  const dir = path.join(root, 'merkava-binary');
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.js') && file !== 'index.js').sort();
  const byFile = {};
  const all = new Set();
  for (const file of files) {
    const keys = requireKeys(path.join('merkava-binary', file));
    byFile[file] = keys;
    keys.forEach(key => all.add(key));
  }
  return { files, byFile, all: [...all].sort() };
}

async function main() {
  const api = require(path.join(root, 'merkavaexecutor.cjs'));
  const binary = require(path.join(root, 'merkava-binary'));
  const service = await import('./merkava-service/index.js?audit=' + Date.now());
  const source = loadBinaryModuleKeys();

  const apiKeys = Object.keys(api).sort();
  const binaryKeys = Object.keys(binary).sort();
  const serviceKeys = Object.keys(service).sort();
  const missingFromBinary = source.all.filter(key => !(key in binary));
  const missingFromApi = source.all.filter(key => !(key in api));

  const requiredApi = [
    'compile', 'compileToBinary', 'compileToBin', 'execute', 'executeBinary',
    'executeRawJS', 'executeRaw', 'executeJSON', 'executeJson', 'executeWeb',
    'executeSTD', 'executeStd', 'magicOf', 'ByteReader', 'ByteWriter',
    'createDefaultHost', 'lowerAstToJson', 'loadMerkavaVm', 'readVarUint',
    'writeVarUint'
  ];
  const requiredService = [
    'simulateRuntime', 'runtimeWorkflow', 'normalizeOptions', 'instrumentFiles',
    'executeWorkflow', 'evaluateCondition', 'createActionRegistry',
    'applyInteractions', 'normalizeRuntimeResult', 'instrumentSource',
    'probeId', 'makeProbeId'
  ];

  assert(missingFromBinary.length === 0, 'merkava-binary/index.js must expose every binary module export', { missingFromBinary, source });
  assert(missingFromApi.length === 0, 'merkavaexecutor.cjs must expose every binary module export', { missingFromApi });
  assert(requiredApi.every(key => key in api), 'Top-level MerkavaExecutor API missing required keys', { requiredApi, apiKeys });
  assert(requiredService.every(key => key in service), 'Merkava service barrel missing required keys', { requiredService, serviceKeys });
  assert(api.compileToBinsry === api.compileToBinary, 'Legacy misspelled compileToBinsry alias must remain stable');
  assert(api.executeRawJSC === api.executeRawJS, 'Legacy executeRawJSC alias must remain stable');
  assert(service.makeProbeId === service.probeId, 'makeProbeId alias must point to probeId');

  console.log(JSON.stringify({ ok: true, binaryFiles: source.files.length, binaryKeys: binaryKeys.length, apiKeys: apiKeys.length, serviceKeys }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, details: error.details || {} }, null, 2));
  process.exit(1);
});
