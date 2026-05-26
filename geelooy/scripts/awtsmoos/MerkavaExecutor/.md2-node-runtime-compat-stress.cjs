// B"H
'use strict';

const assert = require('assert');
const {
  encodeMode2JsModuleGraph,
  encodeMode2JsBinary,
  runMode2JsBinary,
  isMode2JsBinary
} = require('./merkava-binary/Mode2JsBinary.js');

const TESTS = [
  ['commonjs-basic', {
    files: {
      '/main.js': `const dep=require('./dep.js'); __awtsmoosResult=dep.x+2;`,
      '/dep.js': `exports.x=40;`
    }, entry: '/main.js'
  }, 42],
  ['commonjs-module-exports', {
    files: {
      '/main.js': `const dep=require('./dep.js'); __awtsmoosResult=dep(40);`,
      '/dep.js': `module.exports=function(x){return x+2}`
    }, entry: '/main.js'
  }, 42],
  ['process-basic', `__awtsmoosResult=process.cwd().length>0 && Array.isArray(process.argv) ? 42 : 0;`, 42],
  ['buffer-basic', `let b=Buffer.from('BH'); __awtsmoosResult=b.toString()==='BH' && b.length===2 ? 42 : 0;`, 42],
  ['path-basic', `const path=require('path'); __awtsmoosResult=path.join('a','b')==='a/b' && path.basename('/x/y.txt')==='y.txt' ? 42 : 0;`, 42],
  ['url-basic', `const {URL}=require('url'); let u=new URL('https://a.test/p?q=40'); __awtsmoosResult=u.searchParams.get('q')*1+2;`, 42],
  ['events-basic', `const {EventEmitter}=require('events'); let e=new EventEmitter(), out=0; e.on('x',v=>{out=v+2}); e.emit('x',40); __awtsmoosResult=out;`, 42],
  ['timers-nexttick-immediate', `let out=0; process.nextTick(()=>{out+=20}); setImmediate(()=>{out+=22}); __awtsmoosResult=out;`, 42]
];

async function compile(spec) {
  if (typeof spec === 'string') return encodeMode2JsBinary(spec);
  return encodeMode2JsModuleGraph(spec);
}

(async () => {
  const results = [];
  for (const [name, source, expected] of TESTS) {
    try {
      const binary = await compile(source);
      assert.ok(isMode2JsBinary(binary), name);
      const run = runMode2JsBinary(binary, { nodeCompat: true, globals: { URL, URLSearchParams } });
      results.push({ name, pass: Object.is(run.result, expected), expected, result: run.result, bytes: binary.length });
    } catch (error) {
      results.push({ name, pass: false, error: String(error && error.message || error).split('\n')[0] });
    }
  }
  const failed = results.filter(result => !result.pass);
  console.log(JSON.stringify({ ok: failed.length === 0, failed: failed.map(x => x.name), results }, null, 2));
  if (failed.length) process.exit(1);
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
