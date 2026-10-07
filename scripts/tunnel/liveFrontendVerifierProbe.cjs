// B"H
// Boruch Hashem
// Blessed is He
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),http=require("node:http"),assert=require("node:assert/strict");
const {execFileSync}=require("node:child_process");
const {verify}=require(process.env.AWTSMOOS_FRONTEND_PROBE_RUNTIME_ROOT?path.join(process.env.AWTSMOOS_FRONTEND_PROBE_RUNTIME_ROOT,"tools/chrome/frontendVerifier.js"):"../../geelooy/apps/tunnel/agent/tools/chrome/frontendVerifier.js");
const root=fs.mkdtempSync(path.join(os.tmpdir(),"awtsmoos-browser-proof-")),state=fs.mkdtempSync(path.join(os.tmpdir(),"awtsmoos-browser-state-"));
execFileSync("git",["init","-q",root]);execFileSync("git",["-C",root,"-c","user.name=Awtsmoos","-c","user.email=test@example.invalid","commit","--allow-empty","-qm","fixture"]);
const css="body{margin:0;background:#112238;color:white;font:18px sans-serif}main{max-width:900px;padding:24px}button{min-height:48px;padding:12px}#result{padding:12px}";
fs.writeFileSync(path.join(root,"style.css"),css);execFileSync("git",["-C",root,"add","style.css"]);execFileSync("git",["-C",root,"-c","user.name=Awtsmoos","-c","user.email=test@example.invalid","commit","-qm","fixture stylesheet"]);
const server=http.createServer((req,res)=>{
 if(req.url==="/stale-release/"){res.setHeader("Content-Type","application/json");return res.end(JSON.stringify({ok:true,releaseSha:"0".repeat(40)}));}
 if(req.url==="/api/release/"){res.setHeader("Content-Type","application/json");return res.end(JSON.stringify({ok:true,releaseSha:execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim(),evidence:"fixture_process_identity"}));}
 if(req.url==="/style.css"){res.setHeader("Content-Type","text/css");return res.end(css);}
 if(req.url==="/missing.css"){res.statusCode=404;return res.end("missing owned fixture");}
 const broken=req.url==="/broken";
 res.setHeader("Content-Type","text/html");
 res.end('<!doctype html><!-- B"H --><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="'+(broken?"/missing.css":"/style.css")+'"><main><h1>Awtsmoos real verification fixture</h1><button id="open" onclick="document.getElementById(\'result\').hidden=false">Reveal witness</button><div id="result" hidden>Awtsmoos interaction passed</div></main>');
});
(async()=>{
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 const url="http://127.0.0.1:"+server.address().port,config={root,deviceStateRoot:state};
 try{
  const payload={url:url+"/good",widths:[390,768,1440],steps:[{type:"click",selector:"#open"},{type:"assertVisible",selector:"#result"}],settleMs:500,styleAssertions:[{selector:"button",property:"min-height",equals:"48px"}]};
  const good=await verify(payload,config);assert.equal(good.ok,true,JSON.stringify(good));assert.equal(good.interactionVerified,true);assert.ok(good.samples.every(s=>s.interactionVerified&&s.screenshotState==="after_requested_interactions"&&s.screenshotBytes>0));
  const bad=await verify({...payload,url:url+"/broken",widths:[390]},config);fs.writeFileSync("/tmp/awtsmoos-bad-css-result.json",JSON.stringify(bad,null,2));assert.equal(bad.ok,false);assert.ok(bad.samples.some(s=>s.styles.some(x=>!x.loaded)||s.errors.length||s.networkAndConsoleErrors.length));
  const stale=await verify({...payload,widths:[390],releaseUrl:url+"/stale-release/"},config);assert.equal(stale.ok,false);assert.equal(stale.commitVerified,false);
  const hashes=await verify({...payload,widths:[390],releaseUrl:url+"/stale-release/",assetContracts:[{url:url+"/style.css",path:"style.css"}]},config);assert.equal(hashes.ok,true,JSON.stringify(hashes));assert.equal(hashes.assetChecks[0].ok,true);
  const report={ok:true,good,oldReleaseRejected:!stale.ok,servedAssetHashVerified:hashes.assetChecks[0].ok,deliberateBrokenCss:{ok:bad.ok,errors:bad.samples.map(s=>({styles:s.styles,errors:s.errors,networkAndConsoleErrors:s.networkAndConsoleErrors}))},root,state};
  fs.writeFileSync("/tmp/awtsmoos-real-frontend-proof.json",JSON.stringify(report,null,2));
  console.log(JSON.stringify({ok:true,goodReportId:good.id,widths:good.samples.map(s=>s.width),interactionVerified:good.interactionVerified,badCssRejected:true,oldReleaseRejected:true,servedAssetHashVerified:true,screenshots:good.samples.map(s=>s.screenshotPath),evidence:"/tmp/awtsmoos-real-frontend-proof.json"}));
 }finally{server.close();fs.rmSync(root,{recursive:true,force:true});}
})().then(()=>process.exit(0)).catch(error=>{console.error(error);server.close();process.exit(1);});
