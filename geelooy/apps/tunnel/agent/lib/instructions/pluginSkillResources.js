// B"H
// Boruch Hashem
// Blessed is He

const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const index=require("./pluginSkills/index.json");
const byPath=new Map(index.resources.map(r=>[r.path,r]));
/** The Awtsmoos gives every external agent bounded access to the same released skill scrolls. */
function catalog(payload={}){
 const offset=integer(payload.offset,0,0,100000),limit=integer(payload.limit,32,1,64);
 const query=String(payload.query||"").slice(0,200).toLowerCase();
 const all=index.resources.filter(r=>r.path.toLowerCase().includes(query));
 return {ok:true,pluginVersion:index.pluginVersion,source:"released_plugin_skill_mirror",total:all.length,resources:all.slice(offset,offset+limit),
  nextOffset:offset+limit<all.length?offset+limit:null,fetchAction:"instructionResourceGet"};
}
function get(payload={}){
 const resource=byPath.get(String(payload.resourcePath||""));
 if(!resource)throw Error("instruction_resource_unknown");
 if(payload.expectedHash&&payload.expectedHash!==resource.hash)throw Error("instruction_resource_version_changed");
 const file=path.join(__dirname,"pluginSkills",resource.path);
 const bytes=fs.readFileSync(file);
 if(crypto.createHash("sha256").update(bytes).digest("hex")!==resource.hash)throw Error("instruction_resource_integrity_failed");
 const text=bytes.toString("utf8"),offset=integer(payload.offset,0,0,text.length),max=integer(payload.maxChars,8192,256,16384);
 let end=Math.min(text.length,offset+max);
 if(end<text.length&&/[\uD800-\uDBFF]/.test(text[end-1]))end--;
 return {ok:true,pluginVersion:index.pluginVersion,source:"released_plugin_skill_mirror",...resource,
  offset,offsetUnit:"utf16_code_units",content:text.slice(offset,end),nextOffset:end<text.length?end:null,totalChars:text.length};
}
function integer(value,fallback,min,max){if(value===undefined)return fallback;if(!Number.isSafeInteger(value)||value<min||value>max)throw Error("instruction_resource_bounds_invalid");return value;}
module.exports={catalog,get,index};
