// B"H
const fs=require('fs');
class FloatFile{constructor(path,length){this.path=path;this.length=length;this.fd=fs.openSync(path,'w+');fs.ftruncateSync(this.fd,length*4);}write(array,offset=0){const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);fs.writeSync(this.fd,b,0,b.length,offset*4);}read(offset=0,length=this.length-offset){const b=Buffer.allocUnsafe(length*4);fs.readSync(this.fd,b,0,b.length,offset*4);return new Float32Array(b.buffer,b.byteOffset,length);}close(){if(this.fd!==null){fs.closeSync(this.fd);this.fd=null;}}unlink(){this.close();fs.rmSync(this.path,{force:true});}}
module.exports={FloatFile};
