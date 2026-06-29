// B"H
const enc=typeof TextEncoder!=="undefined"?new TextEncoder():null;
const dec=typeof TextDecoder!=="undefined"?new TextDecoder("utf-8"):null;
function encode(text){ if(enc) return enc.encode(text); return new Uint8Array(Buffer.from(text,"utf8")); }
function decode(bytes){ if(dec) return dec.decode(bytes); return Buffer.from(bytes).toString("utf8"); }
module.exports={encode,decode};
