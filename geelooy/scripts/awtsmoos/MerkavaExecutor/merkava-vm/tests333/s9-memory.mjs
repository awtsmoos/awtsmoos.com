// B"H — 333+ JS Stress Tests: S9 memory/GC (34 tests)
// Allocate/deallocate cycles, circular references, retention.
export const suite = 'S9 memory';
const E = (name, src, expect) => ({ name, src, kind: 'eq', expect });
export const tests = [
  E('alloc 10k objs', 'function t(){const a=[];for(let i=0;i<10000;i++)a.push({i});return a.length;} __awtsmoosResult=t();', 10000),
  E('alloc/dealloc cycle', 'function t(){for(let r=0;r<10;r++){const a=[];for(let i=0;i<1000;i++)a.push(i);}return "done";} __awtsmoosResult=t();', 'done'),
  E('circular ref', 'function t(){const a={};a.self=a;return a.self.self===a;} __awtsmoosResult=t();', true),
  E('mutual circular', 'function t(){const a={},b={};a.b=b;b.a=a;return a.b.a===a;} __awtsmoosResult=t();', true),
  E('circular array', 'function t(){const a=[1,2];a.push(a);return a[2][0];} __awtsmoosResult=t();', 1),
  E('deep circular', 'function t(){let o={};let cur=o;for(let i=0;i<100;i++){cur.next={};cur=cur.next;}cur.back=o;return cur.back===o;} __awtsmoosResult=t();', true),
  E('closure retention', 'function t(){const big=new Array(1000).fill(0);return function(){return big.length;};} const f=t();__awtsmoosResult=f();', 1000),
  E('1000 closures mem', 'function t(){const fs=[];for(let i=0;i<1000;i++)fs.push((function(j){return function(){return j;};})(i));return fs[999]();} __awtsmoosResult=t();', 999),
  E('string churn', 'function t(){let s="";for(let i=0;i<5000;i++)s="x"+i;return s;} __awtsmoosResult=t();', 'x4999'),
  E('array churn', 'function t(){let a=[];for(let i=0;i<100;i++){a=[];for(let j=0;j<100;j++)a.push(j);}return a.length;} __awtsmoosResult=t();', 100),
  E('object churn', 'function t(){let o={};for(let i=0;i<1000;i++)o={v:i};return o.v;} __awtsmoosResult=t();', 999),
  E('large nested', 'function t(){let o={};let c=o;for(let i=0;i<500;i++){c.child={};c=c.child;}return "ok";} __awtsmoosResult=t();', 'ok'),
  E('weakmap basic', 'function t(){const wm=new WeakMap();const k={};wm.set(k,42);return wm.get(k);} __awtsmoosResult=t();', 42),
  E('weakmap has', 'function t(){const wm=new WeakMap();const k={};return wm.has(k);} __awtsmoosResult=t();', false),
  E('map 10k', 'function t(){const m=new Map();for(let i=0;i<10000;i++)m.set(i,i*2);return m.get(9999);} __awtsmoosResult=t();', 19998),
  E('set 10k', 'function t(){const s=new Set();for(let i=0;i<10000;i++)s.add(i);return s.size;} __awtsmoosResult=t();', 10000),
  E('set dedupe', 'function t(){const s=new Set([1,1,2,2,3]);return s.size;} __awtsmoosResult=t();', 3),
  E('map overwrite', 'function t(){const m=new Map();m.set("a",1);m.set("a",2);return m.get("a");} __awtsmoosResult=t();', 2),
  E('undef prop', 'function t(){const o={a:1,b:2};o.a=undefined;return o.a+"/"+o.b;} __awtsmoosResult=t();', 'undefined/2'),
  E('splice memory', 'function t(){const a=new Array(1000).fill(1);a.splice(0,999);return a.length;} __awtsmoosResult=t();', 1),
  E('slice copy', 'function t(){const a=[1,2,3];const b=a.slice();b[0]=99;return a[0]+"/"+b[0];} __awtsmoosResult=t();', '1/99'),
  E('concat large', 'function t(){let a=[];for(let i=0;i<10;i++)a=a.concat(new Array(1000).fill(i));return a.length;} __awtsmoosResult=t();', 10000),
  E('json roundtrip big', 'function t(){const o={arr:new Array(1000).fill(1)};return JSON.parse(JSON.stringify(o)).arr.length;} __awtsmoosResult=t();', 1000),
  // B"H 2026-10-09: 999 is correct per-iteration let semantics (matches V8):
  // f captures the i=999 iteration's env; the final i++ runs in the next env.
  E('fn churn', 'function t(){let f=null;for(let i=0;i<1000;i++)f=function(){return i;};return f();} __awtsmoosResult=t();', 999),
  E('class churn', 'function t(){let c=null;for(let i=0;i<100;i++)c=new (class{constructor(){this.v=i;}})();return c.v;} __awtsmoosResult=t();', 99),
  E('regex churn', 'function t(){let ok=true;for(let i=0;i<100;i++)ok=ok&&/x/.test("x");return ok;} __awtsmoosResult=t();', true),
  E('date churn', 'function t(){let d=null;for(let i=0;i<100;i++)d=new Date(2020,0,1);return d.getFullYear();} __awtsmoosResult=t();', 2020),
  E('error churn', 'function t(){let e=null;for(let i=0;i<100;i++){try{throw new Error("x"+i);}catch(x){e=x;}}return e.message;} __awtsmoosResult=t();', 'x99'),
  E('promise churn', 'function t(){let p=null;for(let i=0;i<100;i++)p=Promise.resolve(i);return "ok";} __awtsmoosResult=t();', 'ok'),
  E('typed array', 'function t(){const a=new Uint8Array([1,2,3]);return a[0]+a[2];} __awtsmoosResult=t();', 4),
  E('arraybuffer', 'function t(){const b=new ArrayBuffer(8);return b.byteLength;} __awtsmoosResult=t();', 8),
  E('shared structure', 'function t(){const proto={v:1};const arr=[];for(let i=0;i<1000;i++)arr.push(Object.create(proto));return arr[999].v;} __awtsmoosResult=t();', 1),
  E('interned strings', 'function t(){const a=[];for(let i=0;i<1000;i++)a.push("same");return a[0]===a[999];} __awtsmoosResult=t();', true),
  E('null out', 'function t(){let big=new Array(10000);big=null;return big===null;} __awtsmoosResult=t();', true),
];
