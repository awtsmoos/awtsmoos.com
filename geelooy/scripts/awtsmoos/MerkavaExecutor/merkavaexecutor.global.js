// B"H
(function(root) {
  const OPS = { END:0, CREATE_NODE:1, SET_STYLE:2, BIND_EVENT:3, SET_TEXT:4, APPEND_CHILD:5, EMIT:6 };
  const enc = new TextEncoder(), dec = new TextDecoder();
  const writeVar = (out, n) => { n >>>= 0; while (n >= 128) { out.push((n & 127) | 128); n >>>= 7; } out.push(n); };
  const readVar = r => { let s = 0, v = 0; for (;;) { const b = r.u8(); v |= (b & 127) << s; if (!(b & 128)) return v >>> 0; s += 7; } };
  const bytes = s => Array.from(enc.encode(String(s)));
  const magic = b => String.fromCharCode(...Array.from(b).slice(0,4));
  class Reader { constructor(b){ this.b = new Uint8Array(b); this.i = 0; } u8(){ return this.b[this.i++]; } take(n){ const x=this.b.slice(this.i,this.i+n); this.i+=n; return x; } str(){ return dec.decode(this.take(readVar(this))); } json(){ return JSON.parse(this.str()); } }
  const ref = (pool, value) => { value = value == null ? '' : String(value); let i = pool.indexOf(value); if (i < 0) { i = pool.length; pool.push(value); } return i; };
  const putRef = (out, pool, value) => writeVar(out, ref(pool, value));
  function encodeWebBinary(ir) {
    const pool = [], code = [];
    for (const n of ir.nodes || []) { code.push(OPS.CREATE_NODE); putRef(code,pool,n.tag||'div'); putRef(code,pool,n.id||''); putRef(code,pool,n.text||''); putRef(code,pool,n.parent||''); }
    for (const s of ir.styles || []) for (const k in (s.props || {})) { code.push(OPS.SET_STYLE); putRef(code,pool,s.target||s.selector||''); putRef(code,pool,k); putRef(code,pool,s.props[k]); }
    for (const e of ir.events || []) { code.push(OPS.BIND_EVENT); putRef(code,pool,e.target); putRef(code,pool,e.on); writeVar(code,(e.do||[]).length); for (const a of e.do||[]) { code.push(a.op === 'emit' ? OPS.EMIT : OPS.SET_TEXT); putRef(code,pool,a.target||a.name); putRef(code,pool,a.value); } }
    code.push(OPS.END);
    const out = [...bytes('MWEB'), 1]; const p = bytes(JSON.stringify(pool)); writeVar(out,p.length); out.push(...p); writeVar(out,code.length); out.push(...code); return new Uint8Array(out);
  }
  function decodeWebBinary(bin) {
    const r = new Reader(bin); if (dec.decode(r.take(4)) !== 'MWEB') throw new Error('Bad MWEB magic'); const version = r.u8(); const pool = r.json(); const code = new Reader(r.take(readVar(r))); const get = () => pool[readVar(code)] || ''; const ops = [];
    while (code.i < code.b.length) { const op = code.u8(); if (op === OPS.END) { ops.push({op:'END'}); break; } if (op === OPS.CREATE_NODE) ops.push({op:'CREATE_NODE', tag:get(), id:get(), text:get(), parent:get()}); else if (op === OPS.SET_STYLE) ops.push({op:'SET_STYLE', target:get(), prop:get(), value:get()}); else if (op === OPS.BIND_EVENT) { const target=get(), on=get(), count=readVar(code), actions=[]; for(let i=0;i<count;i++){ const k=code.u8(); actions.push(k===OPS.EMIT?{op:'emit',name:get(),value:get()}:{op:'setText',target:get(),value:get()}); } ops.push({op:'BIND_EVENT',target,on,actions}); } }
    return { version, pool, ops };
  }
  function runWebBinary(bin, options={}) {
    const d = decodeWebBinary(bin), doc = options.document || document, events=[];
    const by = id => id ? doc.getElementById(id) : doc.body;
    for (const item of d.ops) { if (item.op === 'CREATE_NODE') { const el = doc.createElement(item.tag); if(item.id) el.id=item.id; el.textContent=item.text||''; (by(item.parent)||doc.body).appendChild(el); } else if (item.op === 'SET_STYLE') { const el=by(item.target); if(el) el.style[item.prop]=item.value; } else if (item.op === 'BIND_EVENT') { const el=by(item.target); if(el) el.addEventListener(item.on, () => { for(const a of item.actions) { if(a.op==='setText') { const t=by(a.target); if(t)t.textContent=a.value; } else events.push({name:a.name,value:a.value}); } }); } }
    return { ok:true, decoded:d, events, document:doc };
  }
  root.MerkavaExecutor = Object.assign(root.MerkavaExecutor || {}, { encodeWebBinary, decodeWebBinary, runWebBinary, compileToBinary: async (x,o={}) => encodeWebBinary(x), executeBinary: async (b,o={}) => magic(b)==='MWEB'?runWebBinary(b,o):Promise.reject(new Error('Browser global currently supports MWEB directly. Load full Merkava modules for SANG.')), magicOf: magic });
})(globalThis);
