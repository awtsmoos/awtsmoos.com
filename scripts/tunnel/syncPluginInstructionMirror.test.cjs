// B"H
// Boruch Hashem
// Blessed is He
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),os=require("node:os");
const {synchronize}=require("./syncPluginInstructionMirror.cjs");
test("Awtsmoos future plugin skills require matching discovery and exact mirrored source",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"awts-skill-sync-")),repo=path.resolve(__dirname,"../..");
 const source=path.join(root,"source"),instructions=path.join(root,"lib/instructions"),mirror=path.join(instructions,"pluginSkills");
 try{
  fs.mkdirSync(source,{recursive:true});fs.mkdirSync(instructions,{recursive:true});
  fs.cpSync(path.join(repo,"plugins/awtsmoos-shliach/skills"),path.join(source,"skills"),{recursive:true});
  fs.copyFileSync(path.join(repo,"plugins/awtsmoos-shliach/plugin.json"),path.join(source,"plugin.json"));
  fs.cpSync(path.join(repo,"geelooy/apps/tunnel/agent/lib/instructions/pluginSkills"),mirror,{recursive:true});
  for(const name of ["catalogPluginSkills.js","pack.js"])fs.copyFileSync(path.join(repo,"geelooy/apps/tunnel/agent/lib/instructions",name),path.join(instructions,name));
  assert.equal(synchronize(false,{source,mirror}).skills,4);
  const future=path.join(source,"skills/future-workflow");fs.mkdirSync(future);
  fs.writeFileSync(path.join(future,"SKILL.md"),'---\nname: future-workflow\ndescription: Owned future Awtsmoos fixture.\n---\n\n<!-- B"H -->\nInspect actual results.\n');
  assert.throws(()=>synchronize(false,{source,mirror}),/inventory_mismatch/);
  assert.equal(synchronize(true,{source,mirror}).skills,5);
  fs.appendFileSync(path.join(future,"SKILL.md"),"Verify the next step.\n");
  assert.throws(()=>synchronize(false,{source,mirror}),/content_mismatch/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
