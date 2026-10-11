// B"H — 333+ JS Stress Tests: S10 fuzz-ish (34 tests)
// Deterministic pseudo-random valid programs; verify correct results, no crash.
export const suite = 'S10 fuzz';
const E = (name, src, expect) => ({ name, src, kind: 'eq', expect });
function rng(seed){let a=seed;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const R=rng(333);
const pick=(arr)=>arr[Math.floor(R()*arr.length)];
const num=()=>Math.floor(R()*100);
const tests=[];
const OPS=['+','-','*'];
// 12 arithmetic
for(let i=0;i<12;i++){
  const a=num(), b=num()+1, op=pick(OPS);
  const expr=`${a}${op}${b}`;
  tests.push(E(`fuzz arith ${i}`, `__awtsmoosResult=${expr};`, Function(`return ${expr}`)()));
}
// 8 array ops
for(let i=0;i<8;i++){
  const n=3+Math.floor(R()*5);
  const arr=Array.from({length:n},()=>num());
  const op=pick(['sum','len','rev']);
  let src, expect;
  if(op==='sum'){src=`__awtsmoosResult=[${arr}].reduce((a,b)=>a+b,0);`;expect=arr.reduce((a,b)=>a+b,0);}
  else if(op==='len'){src=`__awtsmoosResult=[${arr}].length;`;expect=n;}
  else{src=`__awtsmoosResult=[${arr}].reverse().join(",");`;expect=[...arr].reverse().join(",");}
  tests.push(E(`fuzz array ${i}`, src, expect));
}
// 7 string ops
for(let i=0;i<7;i++){
  const s=pick(['hello','world','foo','bar','baz']);
  const op=pick(['upper','len','rep']);
  let src, expect;
  if(op==='upper'){src=`__awtsmoosResult="${s}".toUpperCase();`;expect=s.toUpperCase();}
  else if(op==='len'){src=`__awtsmoosResult="${s}".length;`;expect=s.length;}
  else{src=`__awtsmoosResult="${s}".repeat(2);`;expect=s.repeat(2);}
  tests.push(E(`fuzz string ${i}`, src, expect));
}
// 7 mixed (function + loop)
for(let i=0;i<7;i++){
  const n=5+Math.floor(R()*10);
  const src=`function f(n){let s=0;for(let i=1;i<=n;i++)s+=i;return s;} __awtsmoosResult=f(${n});`;
  tests.push(E(`fuzz loop ${i}`, src, n*(n+1)/2));
}
export { tests };
