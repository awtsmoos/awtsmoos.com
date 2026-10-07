//B"H
//Boruch Hashem
//Blessed is He
const test=require("node:test"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const {buildInstructionActions}=require("./instructionActionFamily.js");
test("Awtsmoos hosted instructions preserve identity checks and complete plugin discovery",()=>{
 assert.equal(buildInstructionActions(null).instructionCatalog().status,401);
 const catalog=buildInstructionActions("owned-test").instructionCatalog();
 assert.equal(catalog.requiresNativeDevice,false);
 assert.equal(catalog.instructions.filter(x=>x.tags.includes("plugin-skills")).length,4);
 const page=buildInstructionActions("owned-test",{limit:64}).instructionResourceCatalog();
 assert.ok(page.total>=69);
 assert.equal(catalog.pluginSkillResources.pluginVersion,page.pluginVersion);
 const css=buildInstructionActions("owned-test",{query:"CSS_AND_EXTERNAL_VISUAL_VERIFICATION"}).instructionResourceCatalog();
 assert.equal(css.total,1);
 const cssBody=buildInstructionActions("owned-test",{resourcePath:css.resources[0].path,maxChars:16384}).instructionResourceGet();
 assert.match(cssBody.content,/Do not append another/);
 assert.match(cssBody.content,/built-in image inspection tool/);
 const item=page.resources.find(x=>x.path.endsWith("SKILL.md"));
 let offset=0,body="";
 do {const r=buildInstructionActions("owned-test",{resourcePath:item.path,offset,maxChars:1024,expectedHash:item.hash}).instructionResourceGet();body+=r.content;offset=r.nextOffset;}while(offset!==null);
 assert.equal(crypto.createHash("sha256").update(body).digest("hex"),item.hash);
 assert.throws(()=>buildInstructionActions("owned-test",{resourcePath:"../secrets"}).instructionResourceGet(),/unknown/);
});
