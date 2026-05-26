// B"H
'use strict';

const assert = require('assert');
const {
  encodeMode2JsBinary,
  encodeMode2JsModuleGraph,
  runMode2JsBinary,
  isMode2JsBinary,
  decompileMode2JsBinary
} = require('./merkava-binary/Mode2JsBinary.js');

const TESTS = [
  [
    'member-compound-assignment',
    `let o={x:40}; o.x+=2; __awtsmoosResult=o.x;`,
    42
  ],
  [
    'computed-member-compound-assignment',
    `let k='x'; let o={x:40}; o[k]+=2; __awtsmoosResult=o.x;`,
    42
  ],
  [
    'assignment-array-pattern',
    `let a=0,b=0; [a,b]=[20,22]; __awtsmoosResult=a+b;`,
    42
  ],
  [
    'dynamic-spread-array-call',
    `function sum(a,b){return a+b;} let xs=[20,22]; __awtsmoosResult=sum(...xs);`,
    42
  ],
  [
    'dynamic-spread-method-call',
    `let o={sum(a,b){return a+b}}; let xs=[20,22]; __awtsmoosResult=o.sum(...xs);`,
    42
  ],
  [
    'iterator-return-on-break',
    `let closed=0; let it={i:0,next(){this.i++; return this.i<=3?{value:this.i,done:false}:{done:true}},return(){closed=42; return {done:true}}}; it[Symbol.iterator]=function(){return this}; for(const x of it){break;} __awtsmoosResult=closed;`,
    42
  ],
  [
    'generator-throw-internal-catch',
    `function* g(){try{yield 1;}catch(e){yield 41;} yield 1;} let it=g(); let a=it.next(); let b=it.throw(new Error('BH')); let c=it.next(); __awtsmoosResult=a.value+b.value+c.value;`,
    43
  ],
  [
    'proxy-get-set-has-delete',
    `let log=0; let target={x:20}; let p=new Proxy(target,{get(t,k){return t[k]},set(t,k,v){t[k]=v; log+=1; return true},has(t,k){return k in t},deleteProperty(t,k){delete t[k]; log+=1; return true}}); p.y=22; let a=p.x+p.y; let b=('x' in p)?1:0; delete p.x; __awtsmoosResult=a+b+log-3;`,
    42
  ],
  [
    'symbol-toStringTag',
    `let o={[Symbol.toStringTag]:'BH'}; __awtsmoosResult=Object.prototype.toString.call(o)==='[object BH]'?42:0;`,
    42
  ],
  [
    'lexical-slot-captured-loop-locals',
    `let fs=[]; for(let i=0;i<3;i++){ fs.push(()=>i); } __awtsmoosResult=fs[0]()+fs[1]()+fs[2]()+39;`,
    42
  ],
  [
    'const-reassign-throws',
    `let ok=0; try{const x=1; x=2;}catch(e){ok=42;} __awtsmoosResult=ok;`,
    42
  ],
  [
    'tdz-let-before-declare',
    `let ok=0; try{x;}catch(e){ok=42;} let x=1; __awtsmoosResult=ok;`,
    42
  ],
  [
    'import-named-basic',
    {
      files: {
        '/main.js': `import {x} from './dep.js'; __awtsmoosResult=x+2;`,
        '/dep.js': `export const x=40;`
      },
      entry: '/main.js'
    },
    42
  ]
];

async function compileSource(spec) {
  if (typeof spec === 'string') return encodeMode2JsBinary(spec);
  return encodeMode2JsModuleGraph(spec);
}

(async () => {
  const results = [];
  for (const [name, source, expected] of TESTS) {
    try {
      const binary = await compileSource(source);
      assert.ok(isMode2JsBinary(binary), name);
      const run = runMode2JsBinary(binary, { globals: { Error, Proxy, Reflect, Symbol, Object } });
      results.push({ name, pass: Object.is(run.result, expected), expected, result: run.result, bytes: binary.length });
    } catch (error) {
      results.push({ name, pass: false, error: String(error && error.message || error).split('\n')[0] });
    }
  }
  const failed = results.filter(result => !result.pass);
  console.log(JSON.stringify({ ok: failed.length === 0, failed: failed.map(x => x.name), results }, null, 2));
  if (failed.length) process.exit(1);
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
