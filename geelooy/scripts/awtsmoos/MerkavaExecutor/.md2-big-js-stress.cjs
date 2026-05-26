// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

function pct(binaryBytes, sourceBytes) {
  return Number(((1 - binaryBytes / sourceBytes) * 100).toFixed(1));
}

(async () => {
  const lines = [];
  lines.push(`let total = 0;`);
  for (let i = 0; i < 180; i++) {
    lines.push(`let a${i} = ${i % 17};`);
    lines.push(`let b${i} = ${i % 23};`);
    lines.push(`let xs${i} = [a${i} + b${i}, a${i} * b${i}, b${i} - a${i}];`);
    lines.push(`total = total + xs${i}.at(0) + xs${i}.at(1) + xs${i}.at(2);`);
  }
  lines.push(`__awtsmoosResult = total;`);
  const source = lines.join('\n');

  let expected = 0;
  for (let i = 0; i < 180; i++) {
    const a = i % 17, b = i % 23;
    expected += (a + b) + (a * b) + (b - a);
  }

  const binary = await M.compileToBinary(source, { type: 'js' });
  const run = await M.executeBinary(binary, { globals: {} });
  assert.strictEqual(M.magicOf(binary), 'MD2\0');
  assert.strictEqual(Buffer.from(binary)[4], 74);
  assert.strictEqual(run.result, expected);

  const sourceBytes = Buffer.byteLength(source);
  const binaryBytes = binary.length;
  const arenaBytes = run.arenas.bytes;
  const roughObjectRuntimeBytes = sourceBytes + (lines.length * 48);

  console.log(JSON.stringify({
    ok: true,
    kind: 'big-md2-js-section',
    statements: lines.length,
    repeatedBlocks: 180,
    expected,
    result: run.result,
    magic: M.magicOf(binary),
    section: Buffer.from(binary)[4],
    disk: {
      sourceBytes,
      binaryBytes,
      savedPercent: pct(binaryBytes, sourceBytes)
    },
    ramEstimate: {
      roughObjectRuntimeBytes,
      arenaBytes,
      savedPercent: pct(arenaBytes, roughObjectRuntimeBytes),
      note: 'roughObjectRuntimeBytes = source bytes plus 48 bytes per source statement; arenaBytes is actual typed-array opcode/operand lanes from run.arenas.bytes'
    }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
