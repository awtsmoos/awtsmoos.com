// B"H
const fs=require('fs');const os=require('os');const path=require('path');
function makeScratchDir(prefix='awtai-db-chat'){const dir=fs.mkdtempSync(path.join(os.tmpdir(),prefix+'-'));return dir;}
function ensureDir(dir){fs.mkdirSync(dir,{recursive:true});return dir;}
function removeDir(dir){if(dir)fs.rmSync(dir,{recursive:true,force:true});}
module.exports={makeScratchDir,ensureDir,removeDir};
