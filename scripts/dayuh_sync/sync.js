// B"H
const fs = require('fs');
const path = require('path');
const { build } = require('./manifest.js');
const { compare } = require('./diff.js');
const MANIFEST = '.awtsmoos-dayuh-sync-manifest.json';
function emit(callback, event) { if(typeof callback==='function')callback({...event,at:new Date().toISOString()}); }
async function push({ localRoot, adapter, excludes=[], deleteExtraneous=false, dryRun=false, onProgress }) {
  emit(onProgress,{phase:'manifest-local-start'});
  const local=build(localRoot,excludes);
  emit(onProgress,{phase:'manifest-local-complete',files:Object.keys(local.files).length});
  const remote=await adapter.readJson(MANIFEST)||{version:1,files:{}};
  const plan=compare(local,remote), transferred=[];
  emit(onProgress,{phase:'plan',upload:plan.upload.length,remove:deleteExtraneous?plan.remove.length:0,unchanged:plan.unchanged.length});
  if(!dryRun){
    for(let index=0;index<plan.upload.length;index++){
      const relative=plan.upload[index], meta=local.files[relative];
      emit(onProgress,{phase:'upload-start',relative,index:index+1,total:plan.upload.length,bytes:meta.size});
      await adapter.upload(path.join(localRoot,relative),relative);transferred.push(relative);
      emit(onProgress,{phase:'upload-complete',relative,index:index+1,total:plan.upload.length,bytes:meta.size});
    }
    if(deleteExtraneous)for(const relative of plan.remove){emit(onProgress,{phase:'remove',relative});await adapter.remove(relative);}
    await adapter.writeJson(MANIFEST,{...local,root:undefined,syncedAt:new Date().toISOString()});
    emit(onProgress,{phase:'manifest-remote-written'});
  }
  return {direction:'push',dryRun,upload:plan.upload,remove:deleteExtraneous?plan.remove:[],ignoredRemove:deleteExtraneous?[]:plan.remove,unchanged:plan.unchanged.length,transferred};
}
async function pull({ localRoot, adapter, excludes=[], deleteExtraneous=false, dryRun=false, onProgress }) {
  const remote=await adapter.readJson(MANIFEST);if(!remote)throw new Error('Remote manifest not found. Push once before pulling.');
  const local=build(localRoot,excludes), plan=compare(remote,local), transferred=[];
  if(!dryRun){for(const relative of plan.upload){emit(onProgress,{phase:'download-start',relative});await adapter.download(relative,path.join(localRoot,relative));transferred.push(relative);emit(onProgress,{phase:'download-complete',relative});}if(deleteExtraneous)for(const relative of plan.remove)fs.rmSync(path.join(localRoot,relative),{force:true,recursive:true});}
  return {direction:'pull',dryRun,download:plan.upload,remove:deleteExtraneous?plan.remove:[],ignoredRemove:deleteExtraneous?[]:plan.remove,unchanged:plan.unchanged.length,transferred};
}
module.exports = { push, pull, MANIFEST };
