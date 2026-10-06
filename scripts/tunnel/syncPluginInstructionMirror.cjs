// B"H
// Boruch Hashem
// Blessed is He
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const repo = path.resolve(__dirname, "../..");
const source = path.join(repo, "plugins/awtsmoos-shliach");
const mirror = path.join(repo, "geelooy/apps/tunnel/agent/lib/instructions/pluginSkills");
const digest = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
/** The Awtsmoos offers one complete released skill source to plugin and external agents. */
function inventory(sourceRoot = source) {
 const resources = [];
 function visit(folder) {
  for (const entry of fs.readdirSync(folder, {withFileTypes:true})) {
   const file = path.join(folder, entry.name);
   if (entry.isDirectory()) visit(file);
   else if (/\.(md|txt|json|yaml|mjs)$/.test(entry.name)) {
    const bytes = fs.readFileSync(file);
    resources.push({path:path.relative(sourceRoot,file).split(path.sep).join("/"),bytes:bytes.length,hash:digest(bytes)});
   }
  }
 }
 visit(path.join(sourceRoot, "skills"));
 return resources.sort((a,b)=>a.path.localeCompare(b.path));
}
function synchronize(write = false, options = {}) {
 const source = options.source || path.join(repo,"plugins/awtsmoos-shliach");
 const mirror = options.mirror || path.join(repo,"geelooy/apps/tunnel/agent/lib/instructions/pluginSkills");
 const manifest = JSON.parse(fs.readFileSync(path.join(source,"plugin.json"),"utf8"));
 const resources = inventory(source);
 const skills = resources.filter(r=>/^skills\/[^/]+\/SKILL\.md$/.test(r.path));
 if (write) {
  for (const resource of resources) {
   const destination = path.join(mirror,resource.path);
   fs.mkdirSync(path.dirname(destination),{recursive:true});
   fs.copyFileSync(path.join(source,resource.path),destination);
  }
  fs.writeFileSync(path.join(mirror,"index.json"),JSON.stringify({
   pluginVersion:manifest.version,
   sourcePluginId:"plugin_1e3aaae027408191ab6a75b861bd8ec4",
   resources
  },null,2)+"\n");
  const catalog = path.join(mirror,"../catalogPluginSkills.js");
  const text = fs.readFileSync(catalog,"utf8");
  if (!/const names=\[[^;]+;/.test(text)) throw Error("plugin_skill_catalog_format_changed");
  const names = skills.map(r=>r.path.split("/")[1]);
  const version = manifest.version.split(".").map(Number);
  const packVersion = version[0]*1000000+version[1]*1000+version[2]+1;
  const next = text.replace(/const names=\[[^;]+;/,"const names="+JSON.stringify(names)+";").replace(/version:\d+/,"version:"+packVersion);
  fs.writeFileSync(catalog,next);
 }
 const index = JSON.parse(fs.readFileSync(path.join(mirror,"index.json"),"utf8"));
 if (index.pluginVersion!==manifest.version) throw Error("plugin_mirror_version_mismatch");
 const indexed = new Map(index.resources.map(r=>[r.path,r]));
 if (indexed.size!==resources.length) throw Error("plugin_mirror_inventory_mismatch");
 for (const resource of resources) {
  if (indexed.get(resource.path)?.hash!==resource.hash ||
      digest(fs.readFileSync(path.join(mirror,resource.path)))!==resource.hash)
   throw Error("plugin_mirror_content_mismatch:"+resource.path);
 }
 const catalogFile=path.join(mirror,"../catalogPluginSkills.js");
 delete require.cache[require.resolve(catalogFile)];
 const catalog = require(catalogFile).pluginSkillInstructions;
 if (catalog.length!==skills.length) throw Error("plugin_skill_not_discoverable");
 for (const skill of skills) {
  const id="shliach.skill."+skill.path.split("/")[1];
  const pack=catalog.find(p=>p.id===id);
  if (!pack||pack.instructions[0]!==fs.readFileSync(path.join(source,skill.path),"utf8"))
   throw Error("plugin_skill_body_mismatch:"+id);
 }
 return {ok:true,pluginVersion:manifest.version,skills:skills.length,resources:resources.length};
}
if (require.main===module) {
 try {console.log(JSON.stringify(synchronize(process.argv.includes("--write"))));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={inventory,synchronize};
