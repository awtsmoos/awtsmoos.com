// B"H
const assert = require('assert');
const fs = require('fs');
const M = require('./merkavaexecutor.cjs');

function pct(binaryBytes, sourceBytes) {
  return sourceBytes ? Number(((1 - binaryBytes / sourceBytes) * 100).toFixed(1)) : 0;
}

async function runJsCase(name, source, expected) {
  const binary = await M.compileToBinary(source, { type: 'js' });
  assert.strictEqual(M.magicOf(binary), 'MD2\0', `${name}: magic`);
  assert.strictEqual(Buffer.from(binary)[4], 74, `${name}: JS section marker`);
  const result = await M.executeBinary(binary, { globals: {} });
  assert.deepStrictEqual(result.result, expected, `${name}: result`);
  const sourceBytes = Buffer.byteLength(source);
  return {
    name,
    kind: 'md2-js-section',
    sourceBytes,
    binaryBytes: binary.length,
    savedPercent: pct(binary.length, sourceBytes),
    arenaBytes: result.arenas.bytes,
    result: result.result
  };
}

(async () => {
  const cases = [];

  cases.push(await runJsCase('arithmetic-vars', `
    let a = 2;
    let b = 3;
    __awtsmoosResult = a * b + a;
  `, 8));

  cases.push(await runJsCase('array-at-call', `
    let a = 7;
    let b = 5;
    let xs = [a + b, a * b, b - a];
    __awtsmoosResult = xs.at(0) + xs.at(1) + xs.at(2);
  `, 45));

  cases.push(await runJsCase('method-call-multiple-args', `
    let text = 'BH-hello-world';
    __awtsmoosResult = text.slice(3, 8).length + text.indexOf('world');
  `, 14));

  cases.push(await runJsCase('compact-minified-js', `let a=1;let b=2;let c=3;let xs=[a+b,b+c,c+a];__awtsmoosResult=xs.at(0)+xs.at(1)+xs.at(2);`, 12));

  const appBinary = await M.compilePath('.mode2-path-app/index.html');
  assert.strictEqual(M.magicOf(appBinary), 'MD2\0', 'path app magic');
  assert.notStrictEqual(Buffer.from(appBinary)[4], 74, 'path app should not be JS-only section');
  const prod = await M.executePath('.mode2-path-app/index.html', { production: true });
  cases.push({
    name: 'path-app-production',
    kind: 'md2-app',
    binaryBytes: appBinary.length,
    magic: M.magicOf(appBinary),
    arenaBytes: prod.bytes.arena,
    objectShapeBytes: prod.bytes.decodedObjectShape,
    ramSavedPercent: prod.bytes.savedPercent
  });

  console.log(JSON.stringify({ ok: true, cases }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
