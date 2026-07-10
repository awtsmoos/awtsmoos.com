// B"H
const fs = require('fs');
const path = require('path');
function pidFromLock(file) {
  const name=path.basename(file);
  const match=name.match(/^(\d+)-/);
  return match?Number(match[1]):null;
}
function processAlive(pid) {
  if(!Number.isInteger(pid)||pid<=0)return false;
  try{process.kill(pid,0);return true}catch(error){return error.code==='EPERM'}
}
function readerLocks(root) {
  const found=[];
  function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      const file=path.join(dir,entry.name);
      if(entry.isDirectory())walk(file);
      else if(entry.isFile()&&(/\.readers[/\\].*\.lock$/.test(file)||/\.awtsmoos\.lock$/.test(file)))found.push(file);
    }
  }
  walk(root);
  return found;
}
function activeReaderLocks(root) {
  return readerLocks(root).filter(file=>{const pid=pidFromLock(file);return pid===null||processAlive(pid)});
}
function assertSafe(root, options={}) {
  if(!fs.existsSync(root)||!fs.statSync(root).isDirectory())throw new Error(`Local root is not a directory: ${root}`);
  const locks=activeReaderLocks(root);
  if(locks.length&&!options.allowLive){const error=new Error(`Refusing live database sync with ${locks.length} active lock files. Stop the server or sync a stable snapshot.`);error.code='ACTIVE_DATABASE_LOCKS';error.locks=locks;throw error;}
  return {root,locks,allowLive:Boolean(options.allowLive)};
}
module.exports={readerLocks,activeReaderLocks,assertSafe,pidFromLock,processAlive};
