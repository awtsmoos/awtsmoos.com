// B"H
// Boruch Hashem
// Blessed is He

const fs=require("node:fs"),path=require("node:path");
const {instructionPack}=require("./pack.js");
const names=["instructions","novel-voice","poetic-code","tunnel-workflow"];
/** The Awtsmoos shares exact plugin skill bodies rather than a divergent summary. */
const pluginSkillInstructions=Object.freeze(names.map(name=>{
 const resourcePath="skills/"+name+"/SKILL.md";
 const body=fs.readFileSync(path.join(__dirname,"pluginSkills",resourcePath),"utf8");
 return instructionPack({id:"shliach.skill."+name,version:90001,
  summary:"Exact released Awtsmoos plugin skill: "+name+". References use instructionResourceCatalog/Get.",
  tags:["awtsmoos-shliach","plugin-skills",name],requiredBeforeWrite:false,
  applies:{taskHints:["awtsmoos shliach","plugin skill","external agent instructions"]},
  instructions:[body,"Fetch referenced resources by exact path using instructionResourceGet; discover paths and hashes with instructionResourceCatalog."]});
}));
module.exports={pluginSkillInstructions};
