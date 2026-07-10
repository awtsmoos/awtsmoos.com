// B"H
const fs = require('fs');
const nodePath = require('path');
const path = nodePath.posix;
const { KeterClient } = require('../../ayzarim/ssh/Keter-Client.js');
const call = task => new Promise((resolve,reject)=>task((error,value)=>error?reject(error):resolve(value)));
function connect(config) {
  return new Promise((resolve,reject)=>{
    const client=new KeterClient(); let settled=false;
    const done=(error)=>{if(settled)return;settled=true;if(error){try{client.end()}catch{}reject(error)}else resolve(client)};
    client.once('authenticated',()=>done()); client.once('error',done); client.connect(config);
  });
}
class SshAdapter {
  constructor(config, remoteRoot, chunkBytes=1024*1024) { this.config=config; this.root=remoteRoot; this.chunkBytes=chunkBytes; }
  async init() { this.client=await connect(this.config); this.sftp=await new Promise((resolve,reject)=>this.client.sftp((e,s)=>e?reject(e):resolve(s))); await this.mkdirp(this.root); return this; }
  resolve(relative) { return path.join(this.root, relative); }
  async stat(remote) { try{return await call(cb=>this.sftp.stat(remote,cb))}catch{return null} }
  async mkdirp(remote) {
    const parts=path.resolve('/',remote).split('/').filter(Boolean); let current='';
    for(const part of parts){current+=`/${part}`;if(!(await this.stat(current)))await call(cb=>this.sftp.mkdir(current,cb)).catch(async error=>{if(!(await this.stat(current)))throw error});}
  }
  async readBuffer(relative) {
    const remote=this.resolve(relative), stat=await this.stat(remote); if(!stat)return null;
    const handle=await call(cb=>this.sftp.open(remote,'r',cb)); const output=Buffer.alloc(Number(stat.size||0));
    try { let offset=0; while(offset<output.length){const length=Math.min(this.chunkBytes,output.length-offset);const result=await call(cb=>this.sftp.read(handle,output,offset,length,offset,cb));const bytes=Number(result?.bytesRead??result??length);if(!bytes)break;offset+=bytes;} return output; }
    finally { await call(cb=>this.sftp.close(handle,cb)).catch(()=>{}); }
  }
  async readJson(relative) { const buffer=await this.readBuffer(relative); if(!buffer)return null; try{return JSON.parse(buffer.toString('utf8'))}catch{return null} }
  async openRemoteTemp(relative) {
    const remote=this.resolve(relative), temp=`${remote}.awtsmoos-part`;
    await this.mkdirp(path.dirname(remote));
    const handle=await call(cb=>this.sftp.open(temp,'w+',cb));
    return {remote,temp,handle};
  }
  async commitTemp({remote,temp,handle}) {
    await call(cb=>this.sftp.close(handle,cb)).catch(()=>{});
    if(await this.stat(remote))await call(cb=>this.sftp.unlink(remote,cb));
    await call(cb=>this.sftp.rename(temp,remote,cb));
  }
  async writeBuffer(relative, source) {
    const state=await this.openRemoteTemp(relative);
    try { let offset=0; while(offset<source.length){const length=Math.min(this.chunkBytes,source.length-offset);await call(cb=>this.sftp.write(state.handle,source,offset,length,offset,cb));offset+=length;} }
    catch(error){await call(cb=>this.sftp.close(state.handle,cb)).catch(()=>{});throw error;}
    await this.commitTemp(state);
  }
  async writeJson(relative, value) { await this.writeBuffer(relative,Buffer.from(JSON.stringify(value,null,2))); }
  async upload(localFile, relative) {
    const state=await this.openRemoteTemp(relative), fd=fs.openSync(localFile,'r'), buffer=Buffer.allocUnsafe(this.chunkBytes);
    try { let offset=0,bytes=0; while((bytes=fs.readSync(fd,buffer,0,buffer.length,null))>0){await call(cb=>this.sftp.write(state.handle,buffer,0,bytes,offset,cb));offset+=bytes;} }
    catch(error){await call(cb=>this.sftp.close(state.handle,cb)).catch(()=>{});throw error;}
    finally { fs.closeSync(fd); }
    await this.commitTemp(state);
  }
  async download(relative, localFile) { const data=await this.readBuffer(relative);if(!data)throw new Error(`Remote file missing: ${relative}`);fs.mkdirSync(nodePath.dirname(localFile),{recursive:true});const temp=`${localFile}.awtsmoos-part`;fs.writeFileSync(temp,data);fs.renameSync(temp,localFile); }
  async remove(relative) { const remote=this.resolve(relative);if(await this.stat(remote))await call(cb=>this.sftp.unlink(remote,cb)); }
  async close() { try{this.client?.end()}catch{} }
}
module.exports = { SshAdapter, connect };
