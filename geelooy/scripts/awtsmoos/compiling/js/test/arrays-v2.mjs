// B"H — Native arrays v2: differential tests vs V8 + the arraysort benchmark.
// Each case: {name, stmts, expr}. Native compiles (stmts + expr) with the
// trailing expression auto-returned; V8 runs new Function(stmts + return expr).
// Every expr evaluates to a number (undefined is probed via ===undefined / !).
import { compileJsToNativeArrayAsm, NotCompilableError } from "../codegen-arrays.js";
import { execFileSync } from "child_process";

const CASES = [
  ["lit-read", `var a=[10,20,30];`, `a[0]+a[1]+a[2]`],
  ["holes-read", `var a=[1,,3];`, `(a[1]===undefined?100:0)+a[0]+a[2]`],
  ["oob-high", `var a=[1,2];`, `a[5]===undefined?1:0`],
  ["oob-neg", `var a=[1,2]; var i=0-1;`, `a[i]===undefined?1:0`],
  ["oob-huge", `var a=[1,2]; var i=4294967296;`, `a[i]===undefined?1:0`],
  ["length", `var a=[1,2,3];`, `a.length`],
  ["len-trunc", `var a=[1,2,3,4]; a.length=2;`, `a.length+(a[3]===undefined?10:0)+a[0]+a[1]`],
  ["len-trunc-zero", `var a=[1,2]; a.length=0;`, `a.length+(a[0]===undefined?5:0)`],
  ["len-extend", `var a=[1]; a.length=3;`, `(a[2]===undefined?10:0)+(a[1]===undefined?100:0)+a.length`],
  ["len-set-value", `var a=[1,2,3]; var n=(a.length=1);`, `n*10+a.length`],
  ["push", `var a=[]; a.push(5); a.push(7);`, `a[0]*10+a[1]+a.length`],
  ["push-ret", `var a=[]; var n=a.push(9);`, `n`],
  ["push-grow", `var a=[]; for(var i=0;i<100;i++){a.push(i);}`, `a.length+a[0]+a[99]`],
  ["pop", `var a=[1,2,3]; var p=a.pop();`, `p*100+a.length`],
  ["pop-empty", `var a=[]; var p=a.pop();`, `(p===undefined?7:0)+a.length`],
  ["push-then-pop", `var a=[]; a.push(4); a.push(5); var p=a.pop();`, `p*10+a.length`],
  ["set", `var a=[1,2,3]; a[1]=9;`, `a[0]+a[1]+a[2]`],
  ["set-at-len", `var a=[1]; a[1]=2;`, `a.length*10+a[1]`],
  ["set-beyond", `var a=[1]; a[3]=4;`, `a.length*100+(a[2]===undefined?10:0)+a[3]`],
  ["set-neg", `var a=[1,2]; a[0-1]=9;`, `a[0]+a[1]+a.length`],
  ["sort-basic", `var a=[3,1,2]; a.sort(function(x,y){return x-y;});`, `a[0]*100+a[1]*10+a[2]`],
  ["sort-arrow", `var a=[3,1,2]; a.sort((x,y)=>y-x);`, `a[0]*100+a[1]*10+a[2]`],
  ["sort-ternary", `var a=[3,1,2]; a.sort(function(x,y){return x<y?-1:x>y?1:0;});`, `a[0]*100+a[1]*10+a[2]`],
  ["sort-bool-expr", `var a=[2,1,3]; a.sort(function(x,y){return (x>y)-(x<y);});`, `a[0]*100+a[1]*10+a[2]`],
  ["sort-stability", `var v=[3,1,2,1,3]; var ix=[0,1,2,3,4]; ix.sort(function(a,b){return v[a]-v[b];});`,
    `ix[0]*10000+ix[1]*1000+ix[2]*100+ix[3]*10+ix[4]`],
  ["sort-closure-mod", `var a=[2,1,3,4]; a.sort(function(x,y){return (x%2)-(y%2) || x-y;});`,
    `a[0]*1000+a[1]*100+a[2]*10+a[3]`],
  ["sort-default", `var a=[10,9,100,1]; a.sort();`, `a[0]*1000+a[1]*100+a[2]*10+a[3]`],
  ["sort-default-neg", `var a=[3,-20,-5,0]; a.sort();`, `a[0]*1000+a[1]*100+a[2]*10+a[3]`],
  ["sort-with-hole", `var a=[3,,1]; a.sort(function(x,y){return x-y;});`, `a[0]*10+a[1]+(a[2]===undefined?100:0)`],
  ["sort-empty", `var a=[]; a.sort(function(x,y){return x-y;});`, `a.length`],
  ["sort-one", `var a=[42]; a.sort(function(x,y){return x-y;});`, `a[0]`],
  ["for-of", `var a=[1,2,3]; var s=0; for(var x of a){s+=x;}`, `s`],
  ["for-of-hole", `var a=[1,,3]; var s=0; var c=0; for(var x of a){c++; if(x===undefined){s+=100;}}`, `s+c`],
  ["for-of-push", `var a=[1,2]; var s=0; for(var x of a){s+=x; if(a.length<4){a.push(9);}}`, `s+a.length`],
  ["indexed-for", `var a=[5,6,7]; var s=0; for(var i=0;i<a.length;i++){s+=a[i];}`, `s`],
  ["update-elem", `var a=[1,2,3]; a[1]++; ++a[2];`, `a[0]+a[1]+a[2]`],
  ["update-elem-post", `var a=[1,2,3]; var t=a[0]++;`, `t*10+a[0]`],
  ["compound-elem", `var a=[1,2,3]; a[0]+=10; a[2]*=2;`, `a[0]+a[1]+a[2]`],
  ["arith-mod", `var a=[]; for(var i=0;i<20;i++){a.push((i*1103515245+12345)%100000);}`, `a[0]+a[19]`],
  ["truthiness", `var a=[0]; var x=a[5];`, `(!x?1:0)+(!a[0]?2:0)+(a.length?4:0)`],
  ["logic", `var a=[1,2];`, `((a[0]&&a[1])?10:0)+((a[5]||7)===7?1:0)`],
  ["neg-div-mod", `var a=[0-7,10];`, `a[0]%3+(a[1]%3)*10+(a[1]/3)`, `a[0]%3+(a[1]%3)*10+Math.trunc(a[1]/3)`],
  ["trunc-div", `var a=[0-7];`, `a[0]/3`, `Math.trunc(a[0]/3)`], // subset: truncating /
  ["while-push", `var a=[]; var i=0; while(i<50){a.push(i*2); i++;}`, `a.length+a[49]`],
  ["if-else", `var a=[5]; if(a[0]>3){a.push(1);}else{a.push(2);}`, `a[1]`],
  ["break-continue", `var a=[]; for(var i=0;i<10;i++){if(i%2===0){continue;} if(i>7){break;} a.push(i);}`,
    `a.length*100+a[0]*10+a[3]`],
  ["alias-read", `var a=[7,8]; var b=a;`, `b[0]+b[1]+b.length`],
  ["undef-literal", `var a=[1,2,3];`, `(a[2]===undefined?0:1)+(undefined===undefined?10:0)`],
  ["shift-ops", `var a=[8,0-8];`, `(a[0]>>2)+(a[1]>>>2)*10+(a[0]<<1)`],
];

let pass = 0, fail = 0;
const failures = [];
for (const [name, stmts, expr, v8expr] of CASES) {
  const nsrc = `${stmts} ${expr};`;
  const vsrc = `${stmts} return ${v8expr || expr};`;
  let nv, vv, nerr = null;
  try {
    const { path } = await compileJsToNativeArrayAsm(nsrc, null);
    nv = parseInt(execFileSync(path, { encoding: "utf8" }).trim(), 10);
  } catch (e) { nerr = e.message.slice(0, 160); }
  try { vv = new Function(`"use strict"; ${vsrc}`)(); }
  catch (e) { console.log(`V8-ERR ${name}: ${e.message}`); process.exitCode = 1; continue; }
  const ok = nerr === null && Object.is(nv, vv);
  if (ok) { pass++; }
  else { fail++; failures.push([name, nerr || `native=${nv} v8=${vv}`]); }
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` :: ${nerr || `native=${nv} v8=${vv}`}`}`);
}

// Slow-path routing: uncompilable comparators must throw NotCompilableError.
const SLOW = [
  ["3-params", `var a=[2,1]; a.sort(function(x,y,z){return x-y;}); 0;`],
  ["unknown-ident", `var a=[2,1]; a.sort(function(x,y){return x-y+z;}); 0;`],
  ["prop-access", `var a=[2,1]; a.sort((x,y)=>x.foo-y); 0;`],
];
for (const [name, src] of SLOW) {
  try {
    await compileJsToNativeArrayAsm(src, null);
    fail++; failures.push([`slow-${name}`, "expected NotCompilableError, compiled ok"]);
    console.log(`FAIL slow-${name} :: expected NotCompilableError, compiled ok`);
  } catch (e) {
    if (e instanceof NotCompilableError) { pass++; console.log(`ok   slow-${name} (NotCompilableError)`); }
    else { fail++; failures.push([`slow-${name}`, `wrong error: ${e.message.slice(0, 120)}`]); console.log(`FAIL slow-${name} :: wrong error`); }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) { console.log("failures:", JSON.stringify(failures)); process.exitCode = 1; }
