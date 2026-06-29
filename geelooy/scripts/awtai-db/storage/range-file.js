// B"H
const fs=require('fs');
class RangeFile{constructor(path){this.path=path;this.fd=fs.openSync(path,'r');this.size=fs.fstatSync(this.fd).size;}read(offset,length){const b=Buffer.allocUnsafe(length);const n=fs.readSync(this.fd,b,0,length,offset);return n===length?b:b.subarray(0,n);}close(){if(this.fd!==null){fs.closeSync(this.fd);this.fd=null;}}}
module.exports={RangeFile};
