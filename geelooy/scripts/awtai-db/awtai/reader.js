// B"H
const {toBytes,viewOf}=require('../core/bytes.js'); const utf8=require('../core/utf8.js'); const {MAGIC,HEADER_SIZE}=require('../format/constants.js');
function parseAwtaiDb(input){const bytes=toBytes(input);if(utf8.decode(bytes.subarray(0,8))!==MAGIC)throw new Error("B'H not AWTAI-DB");const len=Number(viewOf(bytes).getBigUint64(8,true));const manifest=JSON.parse(utf8.decode(bytes.subarray(HEADER_SIZE,HEADER_SIZE+len)));return{manifest,dataOffset:HEADER_SIZE+len,bytes};}
module.exports={parseAwtaiDb};
