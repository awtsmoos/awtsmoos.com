const fs=require('fs');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const { executeVmFiles } = require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmFileExecutor.js');
(async()=>{
 const options=await collectOptions({p:'geelooy/games/ohr-hagnuz/index.html',waitMs:0}, loadConfig());
 const entry='geelooy/games/ohr-hagnuz/src/tiferet/render/Ground.js';
 const r=await executeVmFiles({files:options.files,entry,globals:{},runtime:'browser'});
 const keys=Object.keys(r.modules).filter(k=>k.includes('WorldPalette')||k.includes('Ground'));
 const palettes=Object.entries(r.modules).filter(([k,v])=>k.includes('WorldPalette')).map(([k,v])=>({k,has:v.WORLD_COLORS&&!!v.WORLD_COLORS.grass,grass:v.WORLD_COLORS&&v.WORLD_COLORS.grass}));
 const row={fileCount:Object.keys(options.files).length, keys, palettes, groundExports:Object.keys(r.exports)};
 fs.writeFileSync('AI_THOUGHTS/runtime-stress/probe-ohr-modules.json',JSON.stringify(row,null,2));
 console.log(JSON.stringify(row,null,2));
})().catch(e=>{console.error(e.stack||e.message);process.exit(1);});
