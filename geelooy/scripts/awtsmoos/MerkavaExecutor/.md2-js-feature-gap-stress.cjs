// B"H
const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary, isMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');

const SHOULD_PASS = [
  ['arithmetic', `let x=5; let y=7; __awtsmoosResult=x*y+7;`, 42],
  ['if-while-for', `let x=0; for(let i=0;i<6;i++){x+=i;} while(x<40){x+=5;} if(x>42){x=42;} __awtsmoosResult=x;`, 40],
  ['callbacks', `let xs=[1,2,3,4]; __awtsmoosResult=xs.map(x=>x*2).filter(x=>x>4).reduce((a,b)=>a+b,0);`, 14],
  ['closure', `function make(a){ return function(b){ return a+b; }; } let f=make(40); __awtsmoosResult=f(2);`, 42]
];

const SHOULD_FAIL_UNTIL_IMPLEMENTED = [
  ['destructuring', `let [a,b]=[20,22]; __awtsmoosResult=a+b;`],
  ['spread-rest', `function sum(...xs){return xs.reduce((a,b)=>a+b,0);} __awtsmoosResult=sum(...[20,22]);`],
  ['try-catch-throw', `try{throw new Error('BH');}catch(e){__awtsmoosResult=42;}`],
  ['async-await', `let x=await Promise.resolve(42); __awtsmoosResult=x;`],
  ['class', `class A{run(){return 42;}} __awtsmoosResult=new A().run();`],
  ['object-spread', `let a={x:20}; let b={...a,y:22}; __awtsmoosResult=b.x+b.y;`],
  ['optional-chain', `let x={a:{b:42}}; __awtsmoosResult=x?.a?.b;`],
  ['ternary', `let x=true ? 42 : 0; __awtsmoosResult=x;`],
  ['switch-break', `let x=0; switch(2){case 2:x=42;break;} __awtsmoosResult=x;`]
];

async function passCase([name, source, expected]) {
  const binary = await encodeMode2JsBinary(source);
  assert.ok(isMode2JsBinary(binary), name);
  const run = runMode2JsBinary(binary);
  assert.strictEqual(run.result, expected, name);
  return { name, ok: true, sourceBytes: Buffer.byteLength(source), binaryBytes: binary.length, result: run.result };
}

async function gapCase([name, source]) {
  try {
    const binary = await encodeMode2JsBinary(source);
    const run = runMode2JsBinary(binary);
    return { name, unexpectedlyPassed: true, binaryBytes: binary.length, result: run.result };
  } catch (error) {
    return { name, unsupported: true, error: String(error.message || error).split('\n')[0] };
  }
}

(async () => {
  const passed = [];
  for (const spec of SHOULD_PASS) passed.push(await passCase(spec));
  const gaps = [];
  for (const spec of SHOULD_FAIL_UNTIL_IMPLEMENTED) gaps.push(await gapCase(spec));
  const unexpected = gaps.filter(x => x.unexpectedlyPassed);
  console.log(JSON.stringify({ ok: true, directMd2: true, passed, gaps, unexpectedPasses: unexpected.map(x => x.name) }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
