// B"H
const assert = require('assert');
const { runJsCode, runJsAsSang, compileJsToJson, compileJsToSang } = require('./merkava-binary');

(async () => {
  const source = `
    let total = seed + 12;
    let product = total * 3;
    __awtsmoosResult = product - 6;
  `;

  const json = await compileJsToJson(source);
  const direct = await runJsCode(source, { globals: { seed: 5 } });
  const packedBin = await compileJsToSang(source);
  const packed = await runJsAsSang(source, { globals: { seed: 5 } });

  assert.strictEqual(direct.ok, true);
  assert.strictEqual(packed.ok, true);
  assert.strictEqual(direct.globals.__awtsmoosResult, 45);
  assert.strictEqual(packed.globals.__awtsmoosResult, 45);
  assert.strictEqual(direct.result, 45);
  assert.strictEqual(packed.result, 45);

  console.log(JSON.stringify({
    ok: true,
    json,
    direct: { result: direct.result, globals: direct.globals },
    packed: { result: packed.result, globals: packed.globals, exactBytes: packedBin.length }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
