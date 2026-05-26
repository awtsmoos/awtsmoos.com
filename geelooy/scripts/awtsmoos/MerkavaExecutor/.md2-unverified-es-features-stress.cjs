// B"H
const { encodeMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');

const TESTS = [
  ['generator-yield', `function* g(){yield 42;} __awtsmoosResult=g().next().value;`, 42],
  ['async-timer', `async function f(){return await new Promise(r=>setTimeout(()=>r(42),1));} __awtsmoosResult=1;`, 1],
  ['esm-export', `export const x=42;`, 42],
  ['class-extends-super', `class A{run(){return 40}} class B extends A{run(){return super.run()+2}} __awtsmoosResult=new B().run();`, 42],
  ['private-fields', `class A{#x=42; run(){return this.#x}} __awtsmoosResult=new A().run();`, 42],
  ['deep-object-destructure', `let {a:{b=40}={}}={a:{}}; __awtsmoosResult=b+2;`, 42],
  ['dynamic-spread', `function sum(a,b){return a+b;} let xs=[20,22]; __awtsmoosResult=sum(...xs);`, 42],
  ['for-of', `let n=0; for(const x of [20,22]) n+=x; __awtsmoosResult=n;`, 42],
  ['continue-statement', `let n=0; for(let i=0;i<10;i++){ if(i%2) continue; n+=i; } __awtsmoosResult=n;`, 20],
  ['do-while', `let x=40; do{x++}while(x<42); __awtsmoosResult=x;`, 42],
  ['delete-operator', `let x={a:1}; delete x.a; __awtsmoosResult=x.a===undefined?42:0;`, 42],
  ['in-operator', `__awtsmoosResult=('x' in {x:42})?42:0;`, 42],
  ['regex-literal', `__awtsmoosResult=/BH/.test('BH')?42:0;`, 42],
  ['map-set', `let m=new Map(); m.set('x',42); __awtsmoosResult=m.get('x');`, 42],
  ['getter-setter', `let x={get a(){return 42}}; __awtsmoosResult=x.a;`, 42],
  ['symbol', `let s=Symbol('x'); let o={[s]:42}; __awtsmoosResult=o[s];`, 42],
  ['cross-frame-throw', `function a(){throw new Error('BH')} try{a()}catch(e){__awtsmoosResult=42}`, 42],
  ['custom-iterator', `let o={[Symbol.iterator]:function*(){yield 20;yield 22;}}; let n=0; for(const x of o)n+=x; __awtsmoosResult=n;`, 42]
];

(async()=>{
  const results=[];
  for(const [name,src,expected] of TESTS){
    try{
      const bin=await encodeMode2JsBinary(src);
      const run=runMode2JsBinary(bin,{globals:{setTimeout,Promise,Map,Set,Symbol,Math,Error}});
      results.push({name,pass:Object.is(run.result,expected),expected,result:run.result,kind:typeof run.result,bytes:bin.length});
    }catch(e){
      results.push({name,pass:false,error:String(e.message||e).split('\n')[0]});
    }
  }
  console.log(JSON.stringify(results,null,2));
})();
