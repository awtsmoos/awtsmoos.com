// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const { compileJsToSang } = require('./MerkavaJsCompiler.js');
const { runCompactClassBinary } = require('./CompactClassBinary.js');
const { runCompactModuleProgram } = require('./CompactModuleBinary.js');
const { encodeWebBinary, decodeWebBinary } = require('./WebBinaryCodec.js');
const { runSang } = require('./SangVmRunner.js');
const { runWebBinary, triggerWebEvent } = require('./WebBinaryRuntime.js');
const { WEB_BUILTINS, WEB_BUILTIN_INDEX } = require('./WebBinaryOpcodes.js');

const MAGIC = 'MAPP';
const VERSION = 2;
const SCRIPT = { SANG: 0, SET_TEXT: 1, SET_TEXT_MULTI: 2, CCLS: 3, CMOD: 4 };

function writeRef(writer, pool, value) {
  const text = value == null ? '' : String(value);
  if (Object.prototype.hasOwnProperty.call(WEB_BUILTIN_INDEX, text)) writer.varUint(WEB_BUILTIN_INDEX[text] << 1);
  else {
    let index = pool.indexOf(text);
    if (index === -1) { index = pool.length; pool.push(text); }
    writer.varUint((index << 1) | 1);
  }
}
function readRef(reader, pool) {
  const ref = reader.varUint();
  return (ref & 1) ? (pool[ref >> 1] || '') : (WEB_BUILTINS[ref >> 1] || '');
}

function nativeScriptOf(source = '') {
  const text = String(source).replace(/\s+/g, ' ');
  const direct = text.match(/([A-Za-z_$][\w$]*)\.textContent\s*=\s*(['"])(.*?)\2/);
  if (direct) return { type: SCRIPT.SET_TEXT, target: direct[1], value: direct[3] };
  const renderConst = text.match(/render\s*\(\s*(['"])(.*?)\1\s*\+\s*['"]:\s*['"]\s*\+\s*(\d+)\s*\)/);
  if (renderConst) return { type: SCRIPT.SET_TEXT_MULTI, pairs: [{ target: 'chat', value: `${renderConst[2]}:${renderConst[3]}` }, { target: 'out', value: `${renderConst[2]}:${renderConst[3]}` }] };
  const method = text.match(/([A-Za-z_$][\w$]*)\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*\{\s*([A-Za-z_$][\w$]*)\.textContent\s*=\s*\2\s*;?\s*\}/);
  const call = text.match(/\.([A-Za-z_$][\w$]*)\s*\(\s*(['"])(.*?)\2\s*\)/);
  if (method && call) return { type: SCRIPT.SET_TEXT, target: method[3], value: call[3] };
  return null;
}

function magicOf(buffer) { return Buffer.from(buffer || []).slice(0, 4).toString('ascii'); }

async function compileUnifiedApp({ web = {}, scripts = [] } = {}) {
  const writer = new ByteWriter();
  const webBin = encodeWebBinary(web);
  const scriptBins = [];
  for (const script of scripts) {
    const native = script.native || nativeScriptOf(script.source || '');
    if (native) scriptBins.push({ name: script.name || '', target: script.target || '', event: script.event || '', native });
    else {
      const binary = script.binary || await compileJsToSang(script.source || '', { scopeName: script.name || 'script' });
      scriptBins.push({ name: script.name || '', target: script.target || '', event: script.event || '', binary, kind: magicOf(binary) === 'CCLS' ? SCRIPT.CCLS : magicOf(binary) === 'CMOD' ? SCRIPT.CMOD : SCRIPT.SANG });
    }
  }
  const pool = [];
  const body = new ByteWriter();
  body.bytesWithLength(webBin);
  body.varUint(scriptBins.length);
  for (const script of scriptBins) {
    writeRef(body, pool, script.name || '');
    writeRef(body, pool, script.target || '');
    writeRef(body, pool, script.event || '');
    if (script.native?.type === SCRIPT.SET_TEXT) {
      body.u8(SCRIPT.SET_TEXT);
      writeRef(body, pool, script.native.target);
      writeRef(body, pool, script.native.value);
    } else if (script.native?.type === SCRIPT.SET_TEXT_MULTI) {
      body.u8(SCRIPT.SET_TEXT_MULTI);
      body.varUint(script.native.pairs.length);
      for (const pair of script.native.pairs) { writeRef(body, pool, pair.target); writeRef(body, pool, pair.value); }
    } else {
      body.u8(script.kind || SCRIPT.SANG);
      body.bytesWithLength(script.binary);
    }
  }
  writer.raw(Buffer.from(MAGIC, 'ascii')).u8(VERSION).json(pool).bytesWithLength(body.toBuffer());
  return writer.toBuffer();
}

function decodeUnifiedApp(buffer) {
  const reader = new ByteReader(buffer);
  const magic = reader.bytes(4).toString('ascii');
  if (magic !== MAGIC) throw new Error(`Bad unified app magic: ${magic}`);
  const version = reader.u8();
  if (version !== VERSION) throw new Error(`Unsupported unified app version: ${version}`);
  const pool = reader.json();
  const body = new ByteReader(reader.bytesWithLength());
  const webBinary = body.bytesWithLength();
  const scripts = [];
  const count = body.varUint();
  for (let i = 0; i < count; i++) {
    const name = readRef(body, pool), target = readRef(body, pool), event = readRef(body, pool), kind = body.u8();
    if (kind === SCRIPT.SET_TEXT) scripts.push({ name, target, event, kind, setText: { target: readRef(body, pool), value: readRef(body, pool) } });
    else if (kind === SCRIPT.SET_TEXT_MULTI) {
      const pairs = []; const n = body.varUint();
      for (let p = 0; p < n; p++) pairs.push({ target: readRef(body, pool), value: readRef(body, pool) });
      scripts.push({ name, target, event, kind, setTextMulti: pairs });
    } else scripts.push({ name, target, event, kind, binary: body.bytesWithLength() });
  }
  return { version, pool, webBinary, web: decodeWebBinary(webBinary), scripts };
}

function runUnifiedApp(buffer, options = {}) {
  const app = decodeUnifiedApp(buffer);
  const web = runWebBinary(app.webBinary, options);
  const scriptResults = [];
  const domGlobals = {};
  if (web.document?.byId) for (const [id, el] of web.document.byId.entries()) domGlobals[id] = el;
  const baseGlobals = { ...(options.globals || {}), ...domGlobals, document: web.document, window: { document: web.document, ...domGlobals } };

  for (const script of app.scripts) {
    const runScript = () => {
      if (script.kind === SCRIPT.SET_TEXT) {
        const el = web.document.getElementById(script.setText.target);
        if (el) el.textContent = script.setText.value;
        const result = { ok: true, native: 'SET_TEXT', target: script.setText.target, value: script.setText.value };
        scriptResults.push({ name: script.name, target: script.target, event: script.event, result });
        return result;
      }
      if (script.kind === SCRIPT.SET_TEXT_MULTI) {
        for (const pair of script.setTextMulti) { const el = web.document.getElementById(pair.target); if (el) el.textContent = pair.value; }
        const result = { ok: true, native: 'SET_TEXT_MULTI', pairs: script.setTextMulti };
        scriptResults.push({ name: script.name, target: script.target, event: script.event, result });
        return result;
      }
      const result = script.kind === SCRIPT.CCLS
        ? runCompactClassBinary(script.binary, { ...options, globals: baseGlobals })
        : script.kind === SCRIPT.CMOD
          ? runCompactModuleProgram(script.binary, baseGlobals)
          : runSang(script.binary, { ...options, globals: { ...baseGlobals, ...(options.globals || {}) } });
      scriptResults.push({ name: script.name, target: script.target, event: script.event, result });
      return result;
    };
    if (script.target && script.event) {
      const el = web.document.getElementById(script.target);
      if (el) el.events[script.event] = runScript;
    } else runScript();
  }
  return { ok: true, app, web, scripts: scriptResults, trigger: (id, event) => triggerWebEvent(web, id, event) };
}

module.exports = { compileUnifiedApp, decodeUnifiedApp, runUnifiedApp, nativeScriptOf, SCRIPT, MAGIC, VERSION };
