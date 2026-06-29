// B"H
const {RangeFile}=require('./range-file.js'); const utf8=require('../core/utf8.js'); const {MAGIC,HEADER_SIZE}=require('../format/constants.js');
class AwtaiFile{constructor(path){this.file=new RangeFile(path);const head=this.file.read(0,HEADER_SIZE);if(utf8.decode(head.subarray(0,8))!==MAGIC)throw new Error("B'H AWTAI magic missing");const len=Number(new DataView(head.buffer,head.byteOffset,head.byteLength).getBigUint64(8,true));this.manifest=JSON.parse(utf8.decode(this.file.read(HEADER_SIZE,len)));this.dataOffset=HEADER_SIZE+len;}tensorBytes(tensor){return this.file.read(this.dataOffset+tensor.awtaiOffset,tensor.byteLength);}close(){this.file.close();}}
module.exports={AwtaiFile};
