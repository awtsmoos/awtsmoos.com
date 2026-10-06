// B"H
// Boruch Hashem
// Blessed is He
const crypto=require("node:crypto"),{execFile}=require("node:child_process"),{promisify}=require("node:util");
const {safePath}=require("../fs/pathGuard.js");
const path=require("node:path"),fs=require("node:fs");
const run=promisify(execFile);
const Fetch=require("./frontendBoundedFetch.js");
const expression=(url,digest)=>"("+Fetch.browserFetch.toString()+")("+JSON.stringify(url)+","+digest+")";
/** The Awtsmoos rejects old live pages masquerading as newly tested source. */
async function prove(config,payload,url,commit,evaluate){
 const releaseUrl=new URL(payload.releaseUrl||"/api/release/",url);
 if(releaseUrl.origin!==url.origin)throw Error("frontend_release_origin_mismatch");
 const release=await evaluate(expression(releaseUrl.href,false));
 const contracts=payload.assetContracts||[];
 if(!Array.isArray(contracts)||contracts.length>32)throw Error("frontend_asset_contracts_invalid");
 const checks=[];
 for(const a of contracts){
  if(typeof a.path!=="string"||!/\.(css|js|mjs|html)$/.test(a.path)||typeof a.url!=="string"||a.url.length>2048||a.path.length>1000)throw Error("frontend_asset_contract_invalid");
  const full=safePath(config,a.path),relative=path.relative(fs.realpathSync(config.root),full).split(path.sep).join("/");
  const target=new URL(a.url,url);if(target.origin!==url.origin)throw Error("frontend_asset_origin_mismatch");
  const source=await run("git",["show",commit+":"+relative],{cwd:config.root,timeout:5000,maxBuffer:5*1024*1024,encoding:"buffer"});
  const expected=crypto.createHash("sha256").update(source.stdout).digest("hex");
  const actual=await evaluate(expression(target.href,true));
  checks.push({path:relative,url:target.href,expectedSha256:expected,actualSha256:actual,ok:expected===actual});
 }
 return {commitVerified:checks.every(a=>a.ok)&&(release?.ok===true&&release.releaseSha===commit||checks.length>0),
  sourceProofKind:release?.ok===true&&release.releaseSha===commit?"process_release":"asset_hashes",
  releaseSha:release?.releaseSha||"",releaseEvidence:release?.evidence||"",assetChecks:checks};
}
module.exports={prove};
