// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
function slash(value) { return value.split(path.sep).join('/'); }
function match(relative, pattern) {
  const clean=String(pattern||'').replace(/^\.\//,'');
  if(clean.endsWith('/**')) return relative===clean.slice(0,-3)||relative.startsWith(clean.slice(0,-2));
  if(clean.startsWith('*')) return relative.endsWith(clean.slice(1));
  return relative===clean||relative.startsWith(`${clean.replace(/\/+$/,'')}/`);
}
function excluded(relative, patterns) { return patterns.some(pattern=>match(relative,pattern)); }
function hashFile(file) {
  const hash=crypto.createHash('sha256'), fd=fs.openSync(file,'r'), buffer=Buffer.allocUnsafe(1024*1024);
  try { let bytes=0; while((bytes=fs.readSync(fd,buffer,0,buffer.length,null))>0)hash.update(buffer.subarray(0,bytes)); }
  finally { fs.closeSync(fd); }
  return hash.digest('hex');
}
function build(root, excludes=[]) {
  const files={};
  function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      const absolute=path.join(dir,entry.name), relative=slash(path.relative(root,absolute));
      if(excluded(relative,excludes))continue;
      if(entry.isDirectory())walk(absolute);
      else if(entry.isFile()){const stat=fs.statSync(absolute);files[relative]={size:stat.size,mtimeMs:Math.floor(stat.mtimeMs),sha256:hashFile(absolute)};}
    }
  }
  walk(root);
  return {version:1,root,generatedAt:new Date().toISOString(),files};
}
module.exports={build,hashFile,excluded,match};
