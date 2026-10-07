// B"H
// Boruch Hashem
// Blessed is He
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
/** The Awtsmoos preserves private checkpoints and admits one living client owner. */
function openJournal(file,binding){
 file=path.resolve(file);fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
 const lock=file+'.lock',reclaim=lock+'.reclaim',token=crypto.randomUUID();
 const alive=pid=>{try{process.kill(pid,0);return true;}catch(e){return e.code!=='ESRCH';}};
 const read=p=>{
  const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
  try{const s=fs.fstatSync(fd);if(!s.isFile()||s.size>32*1024*1024)throw Error('checkpoint_size_or_type_invalid');
   return JSON.parse(fs.readFileSync(fd,'utf8'));
  }finally{fs.closeSync(fd);}
 };
 const acquire=()=>{
  try{const fd=fs.openSync(lock,'wx',0o600);fs.writeFileSync(fd,JSON.stringify({pid:process.pid,token}));fs.closeSync(fd);}
  catch(e){
   if(e.code!=='EEXIST')throw e;
   try{fs.mkdirSync(reclaim,{mode:0o700});}catch{throw Error('checkpoint_owner_reclamation_busy');}
   try{
    const owner=read(lock);if(!Number.isSafeInteger(owner.pid)||owner.pid<1)throw Error('checkpoint_owner_invalid');
    if(alive(owner.pid))throw Error('checkpoint_owned_by_living_process');
    fs.unlinkSync(lock);
   }finally{fs.rmdirSync(reclaim);}
   const fd=fs.openSync(lock,'wx',0o600);fs.writeFileSync(fd,JSON.stringify({pid:process.pid,token}));fs.closeSync(fd);
  }
 };
 acquire();
 const close=()=>{try{if(read(lock).token===token)fs.unlinkSync(lock);}catch(e){if(e.code!=='ENOENT')throw e;}};
 const fingerprint=crypto.createHash('sha256').update(JSON.stringify(binding)).digest('hex');
 let state;
 try{
  try{state=read(file);if(state.version!==1||state.fingerprint!==fingerprint)throw Error('checkpoint_binding_conflict');}
  catch(e){if(e.code!=='ENOENT')throw e;state={version:1,fingerprint,phase:'new',trace:[],outputs:{}};}
 }catch(e){close();throw e;}
 const save=()=>{
  if(read(lock).token!==token)throw Error('checkpoint_ownership_lost');
  const bytes=Buffer.from(JSON.stringify(state));if(bytes.length>32*1024*1024)throw Error('checkpoint_output_budget_exceeded');
  const tmp=file+'.'+token+'.tmp',fd=fs.openSync(tmp,'wx',0o600);
  try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  fs.renameSync(tmp,file);
  const dir=fs.openSync(path.dirname(file),'r');try{fs.fsyncSync(dir);}finally{fs.closeSync(dir);}
 };
 return {state,save,close};
}
module.exports={openJournal};
