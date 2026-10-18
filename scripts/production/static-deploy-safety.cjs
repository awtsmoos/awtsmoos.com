// B"H
// Boruch Hashem
// Blessed is He
// Narrow deployment proof: static browser assets can replace their files without
// killing the Node process (and thereby every tunnel websocket). Everything
// else remains in the normal guarded activation path.
'use strict';
const fs=require('node:fs');
const cp=require('node:child_process');
const path=require('node:path');
const STATIC_PREFIXES=Object.freeze([
 'geelooy/games/mitzvahWorld/',
 'geelooy/apps/rebbe/',
 'geelooy/shliach-plugin/'
]);
const HEX=/^[0-9a-f]{40}$/;
function eligible(files){return Array.isArray(files)&&files.length>0&&files.every(f=>typeof f==='string'&&STATIC_PREFIXES.some(p=>f.startsWith(p))&&!f.includes('..')&&!f.includes('\\'));}
function names(repo,oldSha,newSha){
 if(!HEX.test(oldSha)||!HEX.test(newSha))throw Error('invalid_commit_sha');
 const r=cp.spawnSync('git',['-C',repo,'diff','--no-renames','--name-only','--diff-filter=ACDMRT',oldSha,newSha],{encoding:'utf8',timeout:5000,maxBuffer:1024*1024});
 if(r.status!==0)throw Error('git_diff_failed');
 return r.stdout.split('\n').filter(Boolean);
}
function eligibleRange(repo,oldSha,newSha){return eligible(names(repo,oldSha,newSha));}
function mark(stateFile,sha,pid){
 if(!HEX.test(sha)||!Number.isInteger(pid)||pid<2)throw Error('invalid_deploy_marker');
 fs.mkdirSync(path.dirname(stateFile),{recursive:true,mode:0o700});
 const temporary=stateFile+'.'+process.pid+'.tmp';
 fs.writeFileSync(temporary,JSON.stringify({sha,pid,markedAt:new Date().toISOString()})+'\n',{mode:0o600});
 fs.renameSync(temporary,stateFile);
}
function matches(stateFile,sha,pid){try{const r=JSON.parse(fs.readFileSync(stateFile,'utf8'));return HEX.test(sha)&&r.sha===sha&&r.pid===pid&&pid>1;}catch{return false;}}
if(require.main===module){try{
 const [op,...args]=process.argv.slice(2);
 if(op==='eligible')process.exitCode=eligibleRange(...args)?0:1;
 else if(op==='mark')mark(args[0],args[1],Number(args[2]));
 else if(op==='matches')process.exitCode=matches(args[0],args[1],Number(args[2]))?0:1;
 else throw Error('unknown_mode');
}catch(e){console.error(e.message);process.exitCode=2;}}
module.exports={STATIC_PREFIXES,eligible,names,eligibleRange,mark,matches};
