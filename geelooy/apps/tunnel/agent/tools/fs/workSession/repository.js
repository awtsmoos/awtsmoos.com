// B"H
// Boruch Hashem
// Blessed is He
const {execFile}=require("node:child_process");
const {promisify}=require("node:util");
const run=promisify(execFile);
/** The Awtsmoos ties evidence to a real Git commit and a clean source tree. */
async function snapshot(root) {
 try {
  const options={cwd:root,timeout:5000,maxBuffer:1024*1024};
  const [head,status]=await Promise.all([
   run("git",["rev-parse","HEAD"],options),
   run("git",["status","--porcelain","--untracked-files=normal"],options)
  ]);
  return {ok:true,commit:head.stdout.trim(),clean:status.stdout.trim()==="",dirtyLines:status.stdout.split("\n").filter(Boolean).length};
 }catch(error){return {ok:false,commit:"",clean:false,error:"repository_unavailable"};}
}
module.exports={snapshot};
