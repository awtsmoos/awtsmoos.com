// B"H
/**
 * MerkavaExecutor unified public API.
 * Source compile defaults to MODE2. Production source execution returns
 * compact typed-array arenas; debug execution returns the richer object DOM.
 */
const fs = require('fs');
const binary = require('./merkava-binary');

function isBufferLike(value) { return Buffer.isBuffer(value) || value instanceof Uint8Array || Array.isArray(value); }
function magicOf(buffer) { const b = Buffer.from(buffer || []); return b.length >= 4 ? b.slice(0, 4).toString('ascii') : ''; }
async function compileSourceDefault(input, options = {}) { return options.format === 'mapp' ? binary.compileSourceFilesToApp(input) : binary.compileSourceFilesToMode2(input); }
function sourceArenaResult(input, packed) {
  const arena = binary.createMode2ArenaFromBinary(packed);
  const objectBytes = binary.estimateObjectShapeBytes(input);
  const arenaBytes = arena.bytes.dom + arena.bytes.style + arena.bytes.js + arena.bytes.pool;
  return { ok: true, mode: 'production-arena', magic: magicOf(packed), binaryBytes: packed.length, arena, bytes: { decodedObjectShape: objectBytes, arena: arenaBytes, savedPercent: Number(((1 - arenaBytes / objectBytes) * 100).toFixed(1)) } };
}
async function compileToBinary(input, options = {}) {
  const type = options.type || inferType(input, options);
  if (type === 'source') return compileSourceDefault(input, options);
  if (type === 'path') return compilePath(input, options);
  if (type === 'js') return options.sang ? binary.compileJsToSang(String(input), options) : binary.encodeMode2JsBinary(String(input), options);
  if (type === 'json') return binary.compileJsonToSang(input);
  if (type === 'web') return binary.encodeWebBinary(input);
  if (type === 'app') return binary.compileUnifiedApp(input);
  if (type === 'mode2') return binary.encodeMode2App(input);
  throw new Error(`Unknown compile type: ${type}`);
}
async function compilePath(entryPath, options = {}) {
  const loaded = binary.loadSourcePath(entryPath, options);
  const packed = await compileSourceDefault(loaded, { ...options, type: 'source' });
  return options.meta ? { ok: true, binary: packed, magic: magicOf(packed), files: Object.keys(loaded.files), entry: loaded.entry, root: loaded.root } : packed;
}
async function bundleEntry(input, options = {}) { return binary.bundleSource(typeof input === 'string' ? { entryPath: input } : input, options); }
async function bundleSelf(options = {}) { return binary.bundleMerkavaExecutor(__dirname, options); }
async function writeBinaryPath(entryPath, outPath, options = {}) {
  const packed = await compilePath(entryPath, options);
  const buffer = Buffer.from(packed.binary || packed);
  fs.writeFileSync(outPath, buffer);
  return { ok: true, outPath, bytes: buffer.length, magic: magicOf(buffer) };
}
async function readBinaryPath(filePath, options = {}) { return executeBinary(fs.readFileSync(filePath), options); }
async function executePath(entryPath, options = {}) {
  const loaded = binary.loadSourcePath(entryPath, options);
  const packed = await compileSourceDefault(loaded, options);
  return options.production ? sourceArenaResult(loaded, packed) : executeBinary(packed, options);
}
async function executeBinary(buffer, options = {}) {
  const magic = magicOf(buffer);
  if (magic === 'CCLS') return binary.runCompactClassBinary(Buffer.from(buffer), options);
  if (magic === 'SANG' && options.legacy === true) return binary.runSang(Buffer.from(buffer), options);
  if (magic === 'MWEB') return binary.runWebBinary(Buffer.from(buffer), options);
  if (magic === 'MAPP') return binary.runUnifiedApp(Buffer.from(buffer), options);
  if (magic === 'MD2\u0000' || magic === 'MD2\0') {
    const bytes = Buffer.from(buffer);
    if (binary.isMode2JsBinary?.(bytes)) return binary.runMode2JsBinary(bytes, options);
    return options.production ? { ok: true, mode: 'production-arena', magic, arena: binary.createMode2ArenaFromBinary(bytes) } : binary.runMode2App(bytes, options);
  }
  throw new Error(`Unknown binary magic: ${magic || '<empty>'}`);
}
async function executeRawJS(source, options = {}) { return executeBinary(await compileToBinary(String(source), { ...options, type: 'js' }), options); }
async function executeJSON(program, options = {}) { return binary.runJsonAsSang(program, options); }
async function executeWeb(webIr, options = {}) { return executeBinary(binary.encodeWebBinary(webIr), options); }
async function executeFiles(options = {}) { return binary.executeVmFiles(options); }
async function executeBrowserFiles(files, entry = '/main.js', options = {}) { return executeFiles({ ...options, files, entry, runtime: 'browser' }); }
async function executeNodeFiles(files, entry = '/main.js', options = {}) { return executeFiles({ ...options, files, entry, runtime: 'node' }); }
async function executeWorkerFiles(files, entry = '/worker.js', options = {}) { return executeFiles({ ...options, files, entry, runtime: 'worker' }); }
async function compile(input, options = {}) {
  const type = options.type || inferType(input, options);
  if (type === 'path') return compilePath(input, { ...options, meta: true });
  if (type === 'source') {
    const packed = await compileSourceDefault(input, options);
    return { type, format: magicOf(packed), binary: packed, decoded: options.production ? undefined : (magicOf(packed).startsWith('MD2') ? binary.decodeMode2App(packed) : binary.decodeUnifiedApp(packed)) };
  }
  if (type === 'js') return { type, json: await binary.compileJsToJson(String(input)), binary: await binary.compileJsToSang(String(input), options) };
  if (type === 'json') return { type, code: binary.compileJsonCode(input), binary: binary.compileJsonToSang(input) };
  if (type === 'app') { const packed = await binary.compileUnifiedApp(input); return { type, binary: packed, decoded: binary.decodeUnifiedApp(packed) }; }
  if (type === 'web') { const packed = binary.encodeWebBinary(input); return { type, binary: packed, decoded: binary.decodeWebBinary(packed) }; }
  throw new Error(`Unknown compile type: ${type}`);
}
async function execute(input, options = {}) {
  if (isBufferLike(input)) return executeBinary(input, options);
  if (options.files) return executeFiles({ ...options, files: options.files || input });
  const type = options.type || inferType(input, options);
  if (type === 'path') return executePath(input, options);
  if (type === 'source') { const packed = await compileSourceDefault(input, options); return options.production ? sourceArenaResult(input, packed) : executeBinary(packed, options); }
  if (type === 'js') return executeRawJS(input, options);
  if (type === 'json') return executeJSON(input, options);
  if (type === 'web') return executeWeb(input, options);
  if (type === 'app') return executeBinary(await binary.compileUnifiedApp(input), options);
  throw new Error(`Unknown execute type: ${type}`);
}
async function executeSTD({ stdin = '', type = 'js', globals = {}, hostAPI, document, files, entry, runtime, format, production } = {}) {
  if (files && type === 'source') return execute({ files, entry }, { type, globals, hostAPI, document, format, production });
  if (files) return executeFiles({ files, entry, runtime, globals });
  const parsed = type === 'json' || type === 'web' || type === 'app' || type === 'source' ? JSON.parse(stdin) : stdin;
  return execute(parsed, { type, globals, hostAPI, document, format, production });
}
function inferType(input, options = {}) {
  if (options.path) return 'path';
  if (options.source || input?.files) return 'source';
  if (options.app || input?.web || input?.scripts) return 'app';
  if (options.web || input?.nodes || input?.styles || input?.events) return 'web';
  if (typeof input === 'string') return 'js';
  if (input && typeof input === 'object') return 'json';
  throw new Error('Could not infer Merkava input type. Pass { type }.');
}
module.exports = {
  ...binary, compile, compileToBinary, compileToBinsry: compileToBinary, compileToBin: compileToBinary,
  compilePath, executePath, writeBinaryPath, readBinaryPath,
  bundleEntry, bundleSelf,
  execute, executeBinary, executeRawJS, executeRawJSC: executeRawJS, executeRaw: executeRawJS,
  executeJSON, executeJson: executeJSON, executeWeb, executeFiles, executeFileList: executeFiles,
  executeBrowserFiles, executeNodeFiles, executeWorkerFiles, executeSTD, executeStd: executeSTD,
  magicOf
};
