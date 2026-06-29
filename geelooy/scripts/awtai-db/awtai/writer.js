// B"H
const {concat}=require('../core/bytes.js'); const utf8=require('../core/utf8.js'); const {MAGIC,HEADER_SIZE}=require('../format/constants.js');
function header(len){const out=new Uint8Array(HEADER_SIZE);out.set(utf8.encode(MAGIC).subarray(0,8),0);new DataView(out.buffer).setBigUint64(8,BigInt(len),true);return out;}
function writeAwtaiBytes(manifest,tensorBytes){let m=utf8.encode(JSON.stringify(manifest));manifest.dataRegion.offset=HEADER_SIZE+m.length;m=utf8.encode(JSON.stringify(manifest));manifest.dataRegion.offset=HEADER_SIZE+m.length;m=utf8.encode(JSON.stringify(manifest));return concat([header(m.length),m,tensorBytes]);}
module.exports={writeAwtaiBytes};
