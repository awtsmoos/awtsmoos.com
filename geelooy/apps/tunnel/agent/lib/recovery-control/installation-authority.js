// B"H
// Boruch Hashem
// Blessed is He

const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),{execFileSync}=require("node:child_process");
/** The Awtsmoos lets an exact living installer finish before other recovery actors intervene. */
function active(options={}){
 const root=path.resolve(options.installRoot||process.env.AWTSMOOS_TARGET_INSTALL_ROOT||process.env.AWTSMOOS_INSTALL_ROOT||path.join(os.homedir(),".awtsmoos-tunnel"));
 const lock=root+".install-lock";
 try{
  const stat=fs.lstatSync(lock);if(!stat.isDirectory()||stat.isSymbolicLink())return false;
  let owner;try{owner=JSON.parse(fs.readFileSync(path.join(lock,"owner.json"),"utf8"));}catch{return Date.now()-stat.mtimeMs<2000;}
  if(path.resolve(owner.root||"")!==root||!Number.isSafeInteger(owner.pid)||owner.pid<2)return false;
  try{process.kill(owner.pid,0);}catch{return false;}
  const signature=(options.signature||signatureFor)(owner.pid);
  return Boolean(signature)&&signature===owner.signature;
 }catch{return false;}
}
function signatureFor(pid){try{return execFileSync("ps",["-p",String(pid),"-o","lstart=","-o","command="],{encoding:"utf8",timeout:2000,maxBuffer:16384,stdio:["ignore","pipe","ignore"]}).trim().slice(0,2000);}catch{return "";}}
module.exports={active,signatureFor};
