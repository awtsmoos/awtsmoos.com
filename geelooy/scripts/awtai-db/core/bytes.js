// B"H
function toBytes(input){
  if(input instanceof Uint8Array) return input;
  if(input instanceof ArrayBuffer) return new Uint8Array(input);
  if(typeof Buffer!=="undefined" && Buffer.isBuffer(input)) return new Uint8Array(input.buffer,input.byteOffset,input.byteLength);
  throw new Error("B'H bytes vessel expected Uint8Array, ArrayBuffer, or Buffer");
}
function viewOf(bytes){ return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); }
function concat(parts){ const n=parts.reduce((a,b)=>a+b.length,0); const out=new Uint8Array(n); let p=0; for(const x of parts){out.set(x,p); p+=x.length;} return out; }
module.exports={toBytes,viewOf,concat};
