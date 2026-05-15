// B"H

/**
 * @file semantic_ai_dosdb_test.js
 * @chapter Real Tensor Embeddings And The Native Migration Gate
 * @description
 * Tests the GGUF-token-tensor embedding path, semantic vector search, exact
 * search overlap, and native DosDB-compatible migration without importing the
 * old implementation.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

function u32(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }
function u64(n) { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n)); return b; }
function f32(n) { const b = Buffer.alloc(4); b.writeFloatLE(n); return b; }
function str(s) { const raw = Buffer.from(s); return Buffer.concat([u64(raw.length), raw]); }
function kvString(key, value) { return Buffer.concat([str(key), u32(8), str(value)]); }
function kvStringArray(key, values) {
  return Buffer.concat([str(key), u32(9), u32(8), u64(values.length), ...values.map(str)]);
}
function kvFloatArray(key, values) {
  return Buffer.concat([str(key), u32(9), u32(6), u64(values.length), ...values.map(f32)]);
}

function makeEmbeddingGguf(file) {
  const vocab = ['<unk>', '▁'].concat('abcdefghijklmnopqrstuvwxyz'.split(''));
  const width = 8;
  const values = new Float32Array(width * vocab.length);
  const mark = (token, dims, strength = 3) => {
    const row = vocab.indexOf(token);
    for (const dim of dims) values[dim * vocab.length + row] = strength;
  };
  for (const ch of 'database') mark(ch, [0, 1], 2);
  for (const ch of 'vector') mark(ch, [0, 2], 2);
  for (const ch of 'migration') mark(ch, [3, 4], 2);
  for (const ch of 'awtsmoos') mark(ch, [5, 6], 2);
  for (const ch of 'garden') mark(ch, [7], 2);
  for (const ch of 'archive') mark(ch, [3, 5], 2);
  for (const ch of 'search') mark(ch, [0, 6], 2);

  const kv = [
    kvString('general.architecture', 'bge'),
    kvStringArray('tokenizer.ggml.tokens', vocab),
    kvFloatArray('tokenizer.ggml.scores', new Array(vocab.length).fill(0))
  ];
  const tensorInfo = Buffer.concat([
    str('token_embd.weight'),
    u32(2),
    u64(width),
    u64(vocab.length),
    u32(0),
    u64(0)
  ]);
  const header = Buffer.concat([Buffer.from('GGUF'), u32(3), u64(1), u64(kv.length), ...kv, tensorInfo]);
  const pad = Buffer.alloc((32 - (header.length % 32)) % 32);
  const data = Buffer.alloc(values.length * 4);
  for (let i = 0; i < values.length; i++) data.writeFloatLE(values[i], i * 4);
  fs.writeFileSync(file, Buffer.concat([header, pad, data]));
}

function makeTinyBertGguf(file) {
  const vocab = ['<unk>', 'â–'].concat('abcdefghijklmnopqrstuvwxyz'.split(''));
  const width = 8;
  const tensors = [];
  const addTensor = (name, dims, values) => tensors.push({ name, dims, values: Float32Array.from(values) });
  const values = new Float32Array(width * vocab.length);
  for (let row = 0; row < vocab.length; row++) for (let d = 0; d < width; d++) values[d * vocab.length + row] = ((row + d) % 5) / 5;
  const identity = () => {
    const out = new Float32Array(width * width);
    for (let i = 0; i < width; i++) out[i * width + i] = 1;
    return out;
  };
  const ones = () => new Float32Array(width).fill(1);
  const zeros = () => new Float32Array(width).fill(0);
  addTensor('token_embd.weight', [width, vocab.length], values);
  addTensor('position_embd.weight', [width, 16], new Float32Array(width * 16).fill(0.01));
  addTensor('blk.0.attn_q.weight', [width, width], identity());
  addTensor('blk.0.attn_k.weight', [width, width], identity());
  addTensor('blk.0.attn_v.weight', [width, width], identity());
  addTensor('blk.0.attn_output.weight', [width, width], identity());
  addTensor('blk.0.post_attention_norm.weight', [width], ones());
  addTensor('blk.0.post_attention_norm.bias', [width], zeros());
  addTensor('blk.0.ffn_up.weight', [width, width], identity());
  addTensor('blk.0.ffn_down.weight', [width, width], identity());
  addTensor('blk.0.post_ffw_norm.weight', [width], ones());
  addTensor('blk.0.post_ffw_norm.bias', [width], zeros());

  const kv = [
    kvString('general.architecture', 'bert'),
    kvStringArray('tokenizer.ggml.tokens', vocab),
    kvFloatArray('tokenizer.ggml.scores', new Array(vocab.length).fill(0))
  ];
  let offset = 0;
  const infos = tensors.map((t) => {
    const info = Buffer.concat([str(t.name), u32(t.dims.length), ...t.dims.map(u64), u32(0), u64(offset)]);
    offset += t.values.length * 4;
    return info;
  });
  const header = Buffer.concat([Buffer.from('GGUF'), u32(3), u64(tensors.length), u64(kv.length), ...kv, ...infos]);
  const pad = Buffer.alloc((32 - (header.length % 32)) % 32);
  const data = Buffer.alloc(offset);
  let pos = 0;
  for (const t of tensors) for (let i = 0; i < t.values.length; i++, pos += 4) data.writeFloatLE(t.values[i], pos);
  fs.writeFileSync(file, Buffer.concat([header, pad, data]));
}

module.exports = (async () => {
  const dbPath = TempDbPath.make('semantic_ai_dosdb');
  TempDbPath.remove(dbPath);
  const modelPath = `${dbPath}.embed.gguf`;
  const bertPath = `${dbPath}.bert.gguf`;
  const oldTree = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-old-dosdb-'));
  makeEmbeddingGguf(modelPath);
  makeTinyBertGguf(bertPath);

  fs.mkdirSync(path.join(oldTree, 'letters'), { recursive: true });
  fs.writeFileSync(path.join(oldTree, 'letters', 'one.json'), JSON.stringify({ title: 'native migration', count: 7 }));
  fs.writeFileSync(path.join(oldTree, 'letters', 'blob.bin'), Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));

  const db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: true, turboCompactMs: 10 });
  db.open();
  await db.ai.loadEmbeddingModel(modelPath, { name: 'tiny-real-embed' });

  db.root.semantic = {};
  db.waitForIdle();
  const semantic = db.root.semantic;
  const topics = [
    'database vector search target overlap',
    'migration archive restore native bridge',
    'awtsmoos garden speech light',
    'database search vector index',
    'archive migration record',
    'garden quiet words'
  ];
  const targetBytes = process.env.AWTSMOOSDB_FAST_TEST ? 1024 * 512 : 1024 * 1024 * 50;
  let written = 0;
  let i = 0;
  const exactDatabaseKeys = [];
  while (written < targetBytes) {
    const text = `${topics[i % topics.length]} paragraph ${i} `.repeat(64);
    if (text.includes('database')) exactDatabaseKeys.push(`p${i}`);
    await db.ai.indexTextAsync(semantic, `p${i}`, text, { dimensions: 8, fallback: false });
    written += Buffer.byteLength(text);
    i++;
  }

  const realVector = semantic.p0.vector;
  assert(realVector.length === 8, 'real GGUF tensor embedding dimension');
  assert(realVector[0] > 0.2, 'real GGUF tensor values influence database/vector terms');
  db.waitForIdle();

  const semanticHits = await db.ai.searchTextAsync(semantic, 'database', 16, {
    dimensions: 8,
    fallback: false,
    scanLimit: 200
  });
  const exactHits = new Set(exactDatabaseKeys.slice(0, 100));
  assert(
    semanticHits.some((hit) => exactHits.has(hit.key)),
    `semantic search overlaps exact search hits=${semanticHits.slice(0, 5).map(h => h.key).join(',')} exact=${Array.from(exactHits).slice(0, 5).join(',')}`
  );

  await db.ai.loadEmbeddingModel(bertPath, { name: 'tiny-real-bert', dimensions: 8 });
  const pooledOnly = db.ai.embed('database vector', { dimensions: 8, tokenPoolingOnly: true });
  const transformerFull = db.ai.embed('database vector', { dimensions: 8 });
  let delta = 0;
  for (let d = 0; d < pooledOnly.length; d++) delta += Math.abs(pooledOnly[d] - transformerFull[d]);
  assert(delta > 0.001, 'BERT transformer block changes embedding beyond token pooling');

  const stats = db.DosDB.importPath(oldTree, { rootKey: 'legacy' });
  assert(stats.files === 2, 'native DosDB import sees files');
  assert(db.DosDB.exists('letters/one.json', { rootKey: 'legacy' }), 'native DosDB exists');
  assert(db.DosDB.read('letters/one.json', { rootKey: 'legacy' }).count === 7, 'native DosDB JSON import');
  assert(db.DosDB.readFileWithOffset('letters/blob.bin', 2, 3, { rootKey: 'legacy' })[0] === 3, 'native DosDB blob offset read');
  assert(!db.DosDB.methods().includes('serializeJSON'), 'native DosDB does not expose old imported methods');

  db.waitForIdle();
  db.close();
  TempDbPath.remove(dbPath);
  fs.rmSync(modelPath, { force: true });
  fs.rmSync(bertPath, { force: true });
  fs.rmSync(oldTree, { recursive: true, force: true });

  console.log('B"H semantic_ai_dosdb_test PASS');
})();
